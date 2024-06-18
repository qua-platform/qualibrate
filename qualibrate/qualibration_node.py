import warnings
from contextlib import contextmanager
from importlib import import_module
from importlib.util import find_spec
from pathlib import Path
from typing import Any, Generator, Mapping, Optional, Type

from qualibrate import NodeParameters
from qualibrate.storage import StorageManager
from qualibrate.storage.local_storage_manager import LocalStorageManager


class StopInspection(Exception):
    pass


class QualibrationNode:
    mode: str = "default"
    storage_manager: Optional[StorageManager] = None
    last_instantiated_node: Optional["QualibrationNode"] = None

    _singleton_instance = None  # configurable Singleton features

    # Singleton control
    def __new__(cls, *args: Any, **kwargs: Any) -> "QualibrationNode":
        if cls._singleton_instance is None:
            return super(QualibrationNode, cls).__new__(cls)
        return cls._singleton_instance

    def __init__(
        self,
        name: str,
        parameters_class: Type[NodeParameters],
        description: Optional[str] = None,
    ):
        if hasattr(self, "_initialized"):
            return

        self.name = name
        self.parameters_class = parameters_class
        self.description = description

        self.parameters: Optional[NodeParameters] = None
        self._state_updates: dict[str, Any] = {}
        self.results: dict[Any, Any] = {}
        self.node_filepath: Optional[Path] = None
        self.machine = None

        self._initialized = True

        if self.mode == "inspection":
            # ASK: Looks like `last_instantiated_node` and
            #  `_singleton_instance` have same logic -- keep instance of class
            #  in class-level variable. Is it needed to have both?
            self.__class__.last_instantiated_node = self
            raise StopInspection("Node instantiated in inspection mode")

    @property
    def snapshot_idx(self) -> Optional[int]:
        if self.storage_manager is None:
            return None
        return self.storage_manager.snapshot_idx

    def serialize(self) -> Mapping[str, Any]:
        return {
            "name": self.name,
            "input_parameters": self.parameters_class.serialize(),
            "description": self.description,
        }

    def save(self) -> None:
        if self.storage_manager is None:
            # TODO: fully depend on qualibrate. Need to remove this dependency.
            warnings.warn(
                "Node.storage_manager should be defined to save node, "
                "resorting to default configuration"
            )
            from qualibrate_app.config import get_config_path, get_settings

            config_path = get_config_path()
            settings = get_settings(config_path)
            self.storage_manager = LocalStorageManager(
                root_data_folder=settings.user_storage
            )
        self.storage_manager.save(node=self)

    def run_node(self, input_parameters: NodeParameters) -> None:
        self.parameters = input_parameters
        # self.parameters = self.parameters_class.(**input_parameters)
        # TODO: ASK: probably need to raise exception if node file isn't specified?
        self.run_node_file(self.node_filepath)

    def run_node_file(self, node_filepath: Optional[Path]) -> None:
        try:
            # Temporarily set the singleton instance to this node
            self.__class__._singleton_instance = self
            code = node_filepath.read_text()  # type: ignore[union-attr]
            exec(code)
        finally:
            self.__class__._singleton_instance = None

    def _record_state_update(self, attr: str, val: Any) -> None:
        # TODO: ASK: Only record without set attr?
        self._state_updates[attr] = val

    @contextmanager
    def record_state_updates(self) -> Generator[None, None, None]:
        if self.mode == "interactive":
            # Override QuamComponent.__setattr__()
            quam_core_spec = find_spec("quam.core")
            if quam_core_spec is None:
                yield
                return

            quam_core = import_module("quam.core")
            if not hasattr(quam_core, "QuamBase"):
                yield
                return
            try:
                setattr_func = quam_core.QuamBase.__setattr__
                quam_core.QuamBase.__setattr__ = self._record_state_update
                yield
            finally:
                quam_core.QuamBase.__setattr__ = setattr_func
        else:
            yield
