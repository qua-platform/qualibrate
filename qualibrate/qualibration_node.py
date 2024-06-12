from contextlib import contextmanager
from pathlib import Path
from typing import Any, Mapping, Type, Optional
import warnings

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

    def __init__(self, name, parameters_class: Type[NodeParameters], description=None):
        if hasattr(self, "_initialized"):
            return

        self.name = name
        self.parameters_class = parameters_class
        self.description = description

        self.parameters: Optional[NodeParameters] = None
        self._state_updates = {}
        self.results = {}
        self.node_filepath: Optional[Path] = None
        self.machine = None

        self._initialized = True

        if self.mode == "inspection":
            QualibrationNode.last_instantiated_node = self
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

    def save(self):
        if self.storage_manager is None:
            warnings.warn(
                "Node.storage_manager should be defined to save node, resorting to default configuration"
            )
            from qualibrate_app.config import get_settings, get_config_path

            config_path = get_config_path()
            settings = get_settings(config_path)
            self.storage_manager = LocalStorageManager(
                root_data_folder=settings.user_storage
            )
        self.storage_manager.save(node=self)

    def run_node(self, input_parameters):
        self.parameters = input_parameters
        # self.parameters = self.parameters_class.(**input_parameters)
        self.run_node_file(self.node_filepath)

    def run_node_file(self, node_filepath):
        try:
            # Temporarily set the singleton instance to this node
            self.__class__._singleton_instance = self
            code = node_filepath.read_text()
            exec(code)
        finally:
            self.__class__._singleton_instance = None

    def _record_state_update(self, attr, val):
        self._state_updates[attr] = val

    @contextmanager
    def record_state_updates(self):
        if self.mode == "interactive":
            # Override QuamComponent.__setattr__()
            try:
                from quam.core import QuamBase

                setattr_func = QuamBase.__setattr__
                QuamBase.__setattr__ = self._record_state_update()
                yield
            finally:
                QuamBase.__setattr__ = setattr_func
        else:
            yield

    # Singleton control
    def __new__(cls, *args, **kwargs):
        if cls._singleton_instance is None:
            return super(QualibrationNode, cls).__new__(cls)
        return cls._singleton_instance
