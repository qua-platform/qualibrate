import warnings
from contextlib import contextmanager
from copy import copy
from functools import partialmethod
from pathlib import Path
from types import MappingProxyType
from typing import (
    TYPE_CHECKING,
    Any,
    Dict,
    Generator,
    Mapping,
    Optional,
    Type,
    Union,
)

import matplotlib
from matplotlib.rcsetup import interactive_bk
from pydantic import create_model

from qualibrate.parameters import NodeParameters
from qualibrate.q_runnnable import QRunnable, file_is_calibration_instance
from qualibrate.storage import StorageManager
from qualibrate.storage.local_storage_manager import LocalStorageManager
from qualibrate.utils.exceptions import StopInspection
from qualibrate.utils.logger import logger
from qualibrate.utils.read_files import get_module_name, import_from_path
from qualibrate.utils.type_protocols import (
    GetRefGetItemProtocol,
    GetRefProtocol,
)

if TYPE_CHECKING:
    from qualibrate.qualibration_library import QualibrationLibrary

__all__ = ["QualibrationNode"]

NodeCreateParametersType = NodeParameters
NodeRunParametersType = NodeParameters
QNodeBaseType = QRunnable[NodeCreateParametersType, NodeRunParametersType]


class QualibrationNode(
    QRunnable[NodeCreateParametersType, NodeRunParametersType],
):
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
        parameters_class: Type[NodeCreateParametersType],
        description: Optional[str] = None,
    ):
        if hasattr(self, "_initialized"):
            self._warn_if_external_and_interactive_mpl()
            return
        super(QualibrationNode, self).__init__(name, parameters_class)

        self.description = description

        self._parameters: Optional[NodeCreateParametersType] = None
        self._state_updates: dict[str, Any] = {}
        self.results: dict[Any, Any] = {}
        self.machine = None

        self._initialized = True

        if self.mode.inspection:
            # ASK: Looks like `last_instantiated_node` and
            #  `_singleton_instance` have same logic -- keep instance of class
            #  in class-level variable. Is it needed to have both?
            self.__class__.last_instantiated_node = self
            raise StopInspection("Node instantiated in inspection mode")

    def __copy__(self) -> "QualibrationNode":
        instance = self.__class__(
            self.name, self.parameters_class, self.description
        )
        instance.filepath = self.filepath
        if self.parameters is not None:
            instance.parameters = self.parameters
        return instance

    def copy(self, name: str, **node_parameters: Any) -> "QualibrationNode":
        if not isinstance(name, str):
            raise ValueError(
                f"{self.__class__.__name__} should have a string name"
            )
        inspection = self.__class__.mode.inspection
        self.__class__.mode.inspection = False
        try:
            instance = self.__copy__()
        finally:
            self.__class__.mode.inspection = inspection
        instance.name = name
        if len(node_parameters):
            fields = {
                name: copy(field)
                for name, field in self.parameters_class.model_fields.items()
            }
            # TODO: additional research about more correct field copying way
            for param_name, param_value in node_parameters.items():
                fields[param_name].default = param_value
            new_model = create_model(  # type: ignore
                self.parameters_class.__name__,
                __doc__=self.parameters_class.__doc__,
                __base__=self.parameters_class.__bases__,  # can't pass correct bases
                **{
                    name: (info.annotation, info)
                    for name, info in fields.items()
                },
            )
            instance.parameters_class = new_model

        if self.parameters is not None:
            instance.parameters = instance.parameters_class(
                **self.parameters.model_dump()
            )
        return instance

    def _warn_if_external_and_interactive_mpl(self) -> None:
        mpl_backend = matplotlib.get_backend()
        if self.mode.external and mpl_backend in interactive_bk:
            matplotlib.use("agg")
            raise UserWarning(
                f"Using interactive matplotlib backend '{mpl_backend}' in "
                "external mode. The backend is changed to 'agg'."
            )

    def __str__(self) -> str:
        return f"{self.__class__.__name__}: {self.name}"

    def __repr__(self) -> str:
        return (
            f"{self.__class__.__name__}: {self.name} "
            f"(mode: {self.mode}; parameters: {self.parameters})"
        )

    @property
    def snapshot_idx(self) -> Optional[int]:
        if self.storage_manager is None:
            return None
        return self.storage_manager.snapshot_idx

    def serialize(self, **kwargs: Any) -> Mapping[str, Any]:
        return {
            "name": self.name,
            "parameters": self.parameters_class.serialize(),
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
                root_data_folder=settings.user_storage,
                active_machine_path=settings.active_machine_path,
            )
        self.storage_manager.save(node=self)

    def run(
        self, parameters: Union[NodeRunParametersType, Mapping[str, Any]]
    ) -> None:
        if self.filepath is None:
            raise RuntimeError("Node file path was not provided")
        external = self.mode.external
        interactive = self.mode.interactive
        if isinstance(parameters, Mapping):
            parameters = self.parameters_class(**parameters)
        try:
            self.mode.external = True
            self.mode.interactive = True
            self._parameters = parameters
            # TODO: raise exception if node file isn't specified
            self.run_node_file(self.filepath)
        finally:
            self.mode.external = external
            self.mode.interactive = interactive

    def run_node_file(self, node_filepath: Path) -> None:
        mpl_backend = matplotlib.get_backend()
        # Appending dir with nodes can cause issues with relative imports
        try:
            # Temporarily set the singleton instance to this node
            self.__class__._singleton_instance = self
            matplotlib.use("agg")
            _module = import_from_path(
                get_module_name(node_filepath), node_filepath
            )
        finally:
            self.__class__._singleton_instance = None
            matplotlib.use(mpl_backend)

    @property
    def state_updates(self) -> MappingProxyType[str, Any]:
        return MappingProxyType(self._state_updates)

    @contextmanager
    def record_state_updates(
        self, interactive_only: bool = True
    ) -> Generator[None, None, None]:
        if not self.mode.interactive and interactive_only:
            yield
            return

        # Override QuamComponent.__setattr__()
        try:
            from quam.core import (
                QuamBase,
                QuamComponent,
                QuamDict,
                QuamList,
                QuamRoot,
            )
        except ImportError:
            yield
            return

        quam_classes_mapping = (
            QuamBase,
            QuamComponent,
            QuamRoot,
            QuamDict,
        )
        quam_classes_sequences = (QuamList, QuamDict)

        cls_setattr_funcs = {
            cls: cls.__dict__["__setattr__"]
            for cls in quam_classes_mapping
            if "__setattr__" in cls.__dict__
        }
        cls_setitem_funcs = {
            cls: cls.__dict__["__setitem__"]
            for cls in quam_classes_sequences
            if "__setitem__" in cls.__dict__
        }
        try:
            for cls in cls_setattr_funcs:
                setattr(
                    cls,
                    "__setattr__",
                    partialmethod(_record_state_update_getattr, node=self),
                )
            for cls in cls_setitem_funcs:
                setattr(
                    cls,
                    "__setitem__",
                    partialmethod(_record_state_update_getitem, node=self),
                )
            yield
        finally:
            for cls, setattr_func in cls_setattr_funcs.items():
                setattr(cls, "__setattr__", setattr_func)
            for cls, setitem_func in cls_setitem_funcs.items():
                setattr(cls, "__setitem__", setitem_func)

    @classmethod
    def scan_folder_for_instances(
        cls, path: Path, library: "QualibrationLibrary"
    ) -> Dict[str, QNodeBaseType]:
        nodes: Dict[str, QNodeBaseType] = {}
        inspection = cls.mode.inspection
        try:
            cls.mode.inspection = True

            for file in sorted(path.iterdir()):
                if not file_is_calibration_instance(file, cls.__name__):
                    continue
                cls.scan_node_file(file, nodes)
        finally:
            cls.mode.inspection = inspection
        return nodes

    @classmethod
    def scan_node_file(
        cls, file: Path, nodes: Dict[str, QNodeBaseType]
    ) -> None:
        logger.info(f"Scanning node file {file}")
        try:
            # TODO Think of a safer way to execute the code
            _module = import_from_path(get_module_name(file), file)
        except StopInspection:
            node = cls.last_instantiated_node
            cls.last_instantiated_node = None

            if node is None:
                logger.warning(f"No node instantiated in file {file}")
                return

            node.filepath = file
            node.mode.inspection = False
            cls.add_node(node, nodes)

    @classmethod
    def add_node(
        cls,
        node: "QualibrationNode",
        nodes: Dict[str, QNodeBaseType],
    ) -> None:
        if node.name in nodes:
            logger.warning(
                f'Node "{node.name}" already exists in library, overwriting'
            )

        nodes[node.name] = node


def _record_state_update_getattr(
    quam_obj: GetRefProtocol,
    attr: str,
    val: Any = None,
    node: Optional[QualibrationNode] = None,
) -> None:
    reference = quam_obj.get_reference(attr)
    old = getattr(quam_obj, attr)
    if node:
        node._state_updates[reference] = {
            "key": reference,
            "attr": attr,
            "old": old,
            "new": val,
        }


def _record_state_update_getitem(
    quam_obj: GetRefGetItemProtocol,
    attr: str,
    val: Any = None,
    node: Optional[QualibrationNode] = None,
) -> None:
    reference = quam_obj.get_reference(attr)
    old = quam_obj[attr]
    if node:
        node._state_updates[reference] = {
            "key": reference,
            "attr": attr,
            "old": old,
            "new": val,
        }
