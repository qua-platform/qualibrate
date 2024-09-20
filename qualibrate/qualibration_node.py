import traceback
from collections import UserDict, UserList
from contextlib import contextmanager
from copy import copy
from datetime import datetime
from functools import partialmethod
from importlib.util import find_spec
from pathlib import Path
from typing import (
    TYPE_CHECKING,
    Any,
    Dict,
    Generator,
    Optional,
)

import matplotlib
from matplotlib.rcsetup import interactive_bk

from qualibrate.outcome import Outcome
from qualibrate.parameters import NodeParameters
from qualibrate.q_runnnable import QRunnable, file_is_calibration_instance
from qualibrate.run_summary.base import BaseRunSummary
from qualibrate.run_summary.node import NodeRunSummary
from qualibrate.run_summary.run_error import RunError
from qualibrate.storage import StorageManager
from qualibrate.storage.local_storage_manager import LocalStorageManager
from qualibrate.utils.exceptions import StopInspection
from qualibrate.utils.logger_m import logger
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
        cls._singleton_instance._state_updates.clear()
        return cls._singleton_instance

    def __init__(
        self,
        name: str,
        parameters: NodeCreateParametersType,
        description: Optional[str] = None,
    ):
        logger.info(f"Creating node {name}")
        if hasattr(self, "_initialized"):
            self._warn_if_external_and_interactive_mpl()
            return
        super(QualibrationNode, self).__init__(
            name, parameters, description=description
        )

        self.results: dict[Any, Any] = {}
        self.machine = None

        self._initialized = True

        if self.modes.inspection:
            # ASK: Looks like `last_instantiated_node` and
            #  `_singleton_instance` have same logic -- keep instance of class
            #  in class-level variable. Is it needed to have both?
            self.__class__.last_instantiated_node = self
            raise StopInspection("Node instantiated in inspection mode")

    def __copy__(self) -> "QualibrationNode":
        instance = self.__class__(
            self.name, self.parameters_class(), self.description
        )
        instance.filepath = self.filepath
        return instance

    def copy(
        self, name: Optional[str] = None, **node_parameters: Any
    ) -> "QualibrationNode":
        logger.info(
            f"Copying node with name {self.name} with parameters "
            f"{name = }, {node_parameters = }"
        )
        if name is not None and not isinstance(name, str):
            raise ValueError(
                f"{self.__class__.__name__} should have a string name"
            )
        inspection = self.__class__.modes.inspection
        self.__class__.modes.inspection = False
        try:
            instance = self.__copy__()
        finally:
            self.__class__.modes.inspection = inspection
        if name is not None:
            instance.name = name
        instance._parameters = instance.parameters_class.model_validate(
            node_parameters
        )
        instance.parameters_class = self.build_parameters_class_from_instance(
            instance._parameters
        )
        return instance

    def _warn_if_external_and_interactive_mpl(self) -> None:
        mpl_backend = matplotlib.get_backend()
        if self.modes.external and mpl_backend in interactive_bk:
            matplotlib.use("agg")
            logger.warning(
                f"Using interactive matplotlib backend '{mpl_backend}' in "
                "external mode. The backend is changed to 'agg'."
            )

    def __str__(self) -> str:
        return f"{self.__class__.__name__}: {self.name}"

    def __repr__(self) -> str:
        return (
            f"{self.__class__.__name__}: {self.name} "
            f"(mode: {self.modes}; parameters: {self.parameters})"
        )

    @property
    def snapshot_idx(self) -> Optional[int]:
        if self.storage_manager is None:
            return None
        return self.storage_manager.snapshot_idx

    def save(self) -> None:
        if self.storage_manager is None:
            # TODO: fully depend on qualibrate. Need to remove this dependency.
            msg = (
                "Node.storage_manager should be defined to save node, "
                "resorting to default configuration"
            )
            logger.warning(msg)
            from qualibrate_app.config import get_config_path, get_settings

            config_path = get_config_path()
            settings = get_settings(config_path)
            self.storage_manager = LocalStorageManager(
                root_data_folder=settings.qualibrate.storage.location,
                active_machine_path=settings.active_machine.path,
            )
        self.storage_manager.save(node=self)

    def run(
        self, interactive: bool = True, **passed_parameters: Any
    ) -> BaseRunSummary:
        logger.info(
            f"Run node {self.name} with parameters: {passed_parameters}"
        )
        if self.filepath is None:
            ex = RuntimeError(f"Node {self.name} file path was not provided")
            logger.exception("", exc_info=ex)
            raise ex
        external = self.modes.external
        stored_interactive = self.modes.interactive
        params_dict = (
            self.parameters.model_dump() if self.parameters is not None else {}
        )
        params_dict.update(passed_parameters)
        parameters = self.parameters.model_validate(params_dict)
        initial_targets = copy(parameters.targets) if parameters.targets else []
        created_at = datetime.now()
        run_error: Optional[RunError] = None
        try:
            self.modes.external = True
            self.modes.interactive = interactive
            self._parameters = parameters
            self.run_node_file(self.filepath)
        except Exception as ex:
            run_error = RunError(
                error_class=ex.__class__.__name__,
                message=str(ex),
                traceback=traceback.format_tb(ex.__traceback__),
            )
            logger.exception("", exc_info=ex)
            raise ex
        finally:
            self.modes.external = external
            self.modes.interactive = stored_interactive
        outcomes = self.outcomes
        if self.parameters is not None and (targets := self.parameters.targets):
            lost_targets_outcomes = set(targets) - set(outcomes.keys())
            outcomes.update(
                {target: Outcome.SUCCESSFUL for target in lost_targets_outcomes}
            )
        self.outcomes = {
            name: Outcome(outcome) for name, outcome in outcomes.items()
        }
        run_summary = NodeRunSummary(
            name=self.name,
            description=self.description,
            created_at=created_at,
            completed_at=datetime.now(),
            initial_targets=initial_targets,
            parameters=parameters,
            outcomes=self.outcomes,
            error=run_error,
            successful_targets=[
                name
                for name, status in self.outcomes.items()
                if status == Outcome.SUCCESSFUL
            ],
            failed_targets=[
                name
                for name, status in self.outcomes.items()
                if status == Outcome.FAILED
            ],
            state_updates=self.state_updates,
        )
        logger.debug(f"Node run summary {run_summary}")
        return run_summary

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

    def stop(self, **kwargs: Any) -> bool:
        logger.debug(f"Stop node {self.name}")
        if find_spec("qm") is None:
            return False
        qmm = getattr(self.machine, "qmm", None)
        if not qmm:
            if self.machine is None or not hasattr(self.machine, "connect"):
                return False
            qmm = self.machine.connect()
        if hasattr(qmm, "list_open_qms"):
            ids = qmm.list_open_qms()
        elif hasattr(qmm, "list_open_quantum_machines"):
            ids = qmm.list_open_quantum_machines()
        else:
            return False
        qm = qmm.get_qm(ids[0])
        job = qm.get_running_job()
        if job is None:
            return False
        job.halt()
        return True

    @contextmanager
    def record_state_updates(
        self, interactive_only: bool = True
    ) -> Generator[None, None, None]:
        if not self.modes.interactive and interactive_only:
            yield
            return

        logger.debug(f"Init recording state updates for node {self.name}")
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
        inspection = cls.modes.inspection
        try:
            cls.modes.inspection = True

            for file in sorted(path.iterdir()):
                if not file_is_calibration_instance(file, cls.__name__):
                    continue
                try:
                    cls.scan_node_file(file, nodes)
                except Exception as e:
                    logger.warn(
                        "An error occurred on scanning node file "
                        f"{file.name}.\nError: {type(e)}: {e}"
                    )

        finally:
            cls.modes.inspection = inspection
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
            node.modes.inspection = False
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
    if isinstance(old, UserList):
        old = list(old)
    elif isinstance(old, UserDict):
        old = dict(old)
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
    if isinstance(old, UserList):
        old = list(old)
    elif isinstance(old, UserDict):
        old = dict(old)
    if node:
        node._state_updates[reference] = {
            "key": reference,
            "attr": attr,
            "old": old,
            "new": val,
        }
