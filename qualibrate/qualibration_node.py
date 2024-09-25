import traceback
from collections import UserDict, UserList
from contextlib import contextmanager
from copy import copy
from datetime import datetime
from functools import partialmethod
from importlib.util import find_spec
from pathlib import Path
from typing import (
    Any,
    Dict,
    Generator,
    Optional,
    Sequence,
    Tuple,
    cast,
)

import matplotlib
from matplotlib.rcsetup import interactive_bk
from contextvars import ContextVar

from qualibrate.models.outcome import Outcome
from qualibrate.models.run_mode import RunModes
from qualibrate.models.run_summary.base import BaseRunSummary
from qualibrate.models.run_summary.node import NodeRunSummary
from qualibrate.models.run_summary.run_error import RunError
from qualibrate.parameters import NodeParameters
from qualibrate.q_runnnable import (
    QRunnable,
    run_modes_ctx,
    file_is_calibration_instance,
)
from qualibrate.storage import StorageManager
from qualibrate.storage.local_storage_manager import LocalStorageManager
from qualibrate.utils.exceptions import StopInspection
from qualibrate.utils.logger_m import logger
from qualibrate.utils.read_files import get_module_name, import_from_path
from qualibrate.utils.type_protocols import (
    GetRefGetItemProtocol,
    GetRefProtocol,
    TargetType,
)

__all__ = ["QualibrationNode"]

NodeCreateParametersType = NodeParameters
NodeRunParametersType = NodeParameters
QNodeBaseType = QRunnable[NodeCreateParametersType, NodeRunParametersType]

external_parameters_ctx: ContextVar[Optional[NodeParameters]] = ContextVar(
    "external_parameters", default=None
)
last_executed_node_ctx: ContextVar[Optional["QualibrationNode"]] = ContextVar(
    "last_executed_node", default=None
)


class QualibrationNode(
    QRunnable[NodeCreateParametersType, NodeRunParametersType],
):
    storage_manager: Optional[StorageManager] = None

    def __init__(
        self,
        name: str,
        parameters: NodeCreateParametersType,
        description: Optional[str] = None,
        *,
        modes: Optional[RunModes] = None,
    ):
        logger.info(f"Creating node {name}")
        super(QualibrationNode, self).__init__(
            name,
            parameters,
            description=description,
            modes=modes,
        )

        self.results: dict[Any, Any] = {}
        self.machine = None

        if self.modes.inspection:
            raise StopInspection(
                "Node instantiated in inspection mode", instance=self
            )

        last_executed_node_ctx.set(self)

        self._warn_if_external_and_interactive_mpl()

        external_parameters = external_parameters_ctx.get()
        if external_parameters is not None:
            self._parameters = external_parameters

    def __copy__(self) -> "QualibrationNode":
        modes = self.modes.model_copy(update={"inspection": False})
        instance = self.__class__(
            self.name, self.parameters_class(), self.description, modes=modes
        )
        instance.modes.inspection = self.modes.inspection
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
        instance = self.__copy__()
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

    def _post_run(
        self,
        created_at: datetime,
        initial_targets: Sequence[TargetType],
        parameters: NodeParameters,
        run_error: Optional[RunError],
    ) -> NodeRunSummary:
        outcomes = self.outcomes
        if self.parameters is not None and (targets := self.parameters.targets):
            lost_targets_outcomes = set(targets) - set(outcomes.keys())
            outcomes.update(
                {target: Outcome.SUCCESSFUL for target in lost_targets_outcomes}
            )
        self.outcomes = {
            name: Outcome(outcome) for name, outcome in outcomes.items()
        }
        self.run_summary = NodeRunSummary(
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
        logger.debug(f"Node run summary {self.run_summary}")
        return self.run_summary

    def run(
        self, interactive: bool = True, **passed_parameters: Any
    ) -> Tuple["QualibrationNode", BaseRunSummary]:
        logger.info(
            f"Run node {self.name} with parameters: {passed_parameters}"
        )
        if self.filepath is None:
            ex = RuntimeError(f"Node {self.name} file path was not provided")
            logger.exception("", exc_info=ex)
            raise ex
        params_dict = (
            self.parameters.model_dump() if self.parameters is not None else {}
        )
        params_dict.update(passed_parameters)
        parameters = self.parameters.model_validate(params_dict)
        initial_targets = copy(parameters.targets) if parameters.targets else []
        created_at = datetime.now()
        run_error: Optional[RunError] = None

        try:
            if run_modes_ctx.get() is not None:
                logger.error(
                    "Run modes context is already set to %s",
                    run_modes_ctx.get(),
                )
            run_modes_token = run_modes_ctx.set(
                RunModes(
                    external=True, interactive=interactive, inspection=False
                )
            )

            external_parameters_token = external_parameters_ctx.set(parameters)
            self._parameters = parameters
            self.run_node_file(self.filepath)
        except Exception as ex:
            run_error = RunError(
                error_class=ex.__class__.__name__,
                message=str(ex),
                traceback=traceback.format_tb(ex.__traceback__),
            )
            logger.exception("", exc_info=ex)
            raise
        finally:
            run_modes_ctx.reset(run_modes_token)
            external_parameters_ctx.reset(external_parameters_token)
            run_summary = self._post_run(
                created_at, initial_targets, parameters, run_error
            )

        last_executed_node = last_executed_node_ctx.get()
        if last_executed_node is None:
            logger.warning(
                "Last executed node not set after running {node_to_run}"
            )
            last_executed_node = self

        return last_executed_node, run_summary

    def run_node_file(self, node_filepath: Path) -> None:
        mpl_backend = matplotlib.get_backend()
        # Appending dir with nodes can cause issues with relative imports
        try:
            matplotlib.use("agg")
            _module = import_from_path(
                get_module_name(node_filepath), node_filepath
            )
        finally:
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
    def scan_folder_for_instances(cls, path: Path) -> Dict[str, QNodeBaseType]:
        nodes: Dict[str, QNodeBaseType] = {}
        try:
            if run_modes_ctx.get() is not None:
                logger.error(
                    "Run modes context is already set to %s",
                    run_modes_ctx.get(),
                )
            run_modes_token = run_modes_ctx.set(RunModes(inspection=True))

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
            run_modes_ctx.reset(run_modes_token)
        return nodes

    @classmethod
    def scan_node_file(
        cls, file: Path, nodes: Dict[str, QNodeBaseType]
    ) -> None:
        logger.info(f"Scanning node file {file}")
        try:
            # TODO Think of a safer way to execute the code
            _module = import_from_path(get_module_name(file), file)
        except StopInspection as ex:
            node = cast("QualibrationNode", ex.instance)
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
