import traceback
from collections.abc import Generator, Mapping, Sequence
from contextlib import contextmanager
from contextvars import ContextVar
from copy import copy
from datetime import datetime
from functools import partialmethod
from importlib.util import find_spec
from pathlib import Path
from typing import (
    Any,
    Optional,
    TypeVar,
    Union,
    cast,
)

import matplotlib
from matplotlib.rcsetup import interactive_bk
from pydantic import ValidationError, create_model

from qualibrate.config.utils import get_qualibrate_app_settings
from qualibrate.models.outcome import Outcome
from qualibrate.models.run_mode import RunModes
from qualibrate.models.run_summary.base import BaseRunSummary
from qualibrate.models.run_summary.node import NodeRunSummary
from qualibrate.models.run_summary.run_error import RunError
from qualibrate.parameters import NodeParameters
from qualibrate.q_runnnable import (
    QRunnable,
    file_is_calibration_instance,
    run_modes_ctx,
)
from qualibrate.storage import StorageManager
from qualibrate.storage.local_storage_manager import LocalStorageManager
from qualibrate.utils.exceptions import StopInspection
from qualibrate.utils.logger_m import logger
from qualibrate.utils.node.comined_method import InstanceOrClassMethod
from qualibrate.utils.node.content import (
    parse_node_content,
    read_node_content,
    read_node_data,
)
from qualibrate.utils.node.loaders.base_loader import BaseLoader
from qualibrate.utils.node.path_solver import (
    get_node_dir_path,
)
from qualibrate.utils.node.record_state_update import (
    record_state_update_getattr,
    record_state_update_getitem,
)
from qualibrate.utils.read_files import get_module_name, import_from_path
from qualibrate.utils.type_protocols import TargetType

__all__ = [
    "QualibrationNode",
    "NodeCreateParametersType",
    "NodeRunParametersType",
]

NodeCreateParametersType = NodeParameters
NodeRunParametersType = NodeParameters
ParametersType = TypeVar("ParametersType", bound=NodeParameters)

# TODO: use node parameters type instead of Any
external_parameters_ctx: ContextVar[Optional[tuple[str, Any]]] = ContextVar(
    "external_parameters", default=None
)
last_executed_node_ctx: ContextVar[Optional["QualibrationNode[Any]"]] = (
    ContextVar("last_executed_node", default=None)
)


class QualibrationNode(
    QRunnable[ParametersType, NodeRunParametersType],
):
    """
    Represents a qualibration node (that can be run independently or as part
    of graph), responsible for executing specific tasks with defined parameters
     and modes.

    Args:
        name: The name of the node.
        parameters: Parameters passed to the node for its initialization.
            Defaults to None.
        description: A description of the node. Defaults to None.
        parameters_class: Class used for node parameters validation. Defaults
            to None.
        modes: Execution modes. Defaults to None.

    Raises:
        StopInspection: Raised if the node is instantiated in inspection mode.
    """

    storage_manager: Optional[
        StorageManager["QualibrationNode[NodeParameters]"]
    ] = None

    def __init__(
        self,
        name: str,
        parameters: Optional[ParametersType] = None,
        description: Optional[str] = None,
        *,
        parameters_class: Optional[type[ParametersType]] = None,
        modes: Optional[RunModes] = None,
    ):
        logger.info(f"Creating node {name}")
        parameters = self.__class__._validate_passed_parameters_options(
            name, parameters, parameters_class
        )
        super().__init__(
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
            self.name = external_parameters[0]
            self._parameters = external_parameters[1]

    @classmethod
    def _validate_passed_parameters_options(
        cls,
        name: str,
        parameters: Optional[ParametersType],
        parameters_class: Optional[type[ParametersType]],
    ) -> ParametersType:
        """
        Validates passed parameters and parameters class. If parameters
        passed then the instance will be used. If parameters class is passed,
        an attempt will be made to instantiate it. If neither parameters nor
        parameter class are passed, then the default base parameters will be
        used.

        Args:
            name: The name of the node.
            parameters: Parameters for the node.
            parameters_class: Parameters class.

        Returns:
            Validated parameters.

        Raises:
            ValueError: If parameters class instantiation fails.
        """
        if parameters is not None:
            if parameters_class is not None:
                logger.warning(
                    "Passed both parameters and parameters_class to the node "
                    f"'{name}'. Please use only parameters argument"
                )
            return parameters
        if parameters_class is None:
            fields = {
                name: copy(field)
                for name, field in NodeParameters.model_fields.items()
            }
            # Create subclass of NodeParameters. It's needed because otherwise
            # there will be an issue with type checking of subclasses.
            # For example: NodeRunSummary.parameters
            new_model = create_model(  # type: ignore
                NodeParameters.__name__,
                __doc__=NodeParameters.__doc__,
                __base__=NodeParameters,
                __module__=NodeParameters.__module__,
                **{
                    name: (info.annotation, info)
                    for name, info in fields.items()
                },
            )
            return cast(ParametersType, new_model())
        logger.warning(
            "parameters_class argument is deprecated. Please use "
            f"parameters argument for initializing node '{name}'."
        )
        try:
            return parameters_class()
        except ValidationError as e:
            raise ValueError(
                f"Can't instantiate parameters class of node '{name}'"
            ) from e

    def __copy__(self) -> "QualibrationNode[ParametersType]":
        """
        Creates a shallow copy of the node.

        This method copies the node, including its parameters, name, modes,
        and filepath, while resetting inspection-related modes to maintain
        consistency.

        Returns:
            A copy of the node.
        """
        modes = self.modes.model_copy(update={"inspection": False})
        instance = self.__class__(
            self.name, self.parameters_class(), self.description, modes=modes
        )
        instance.modes.inspection = self.modes.inspection
        instance.filepath = self.filepath
        return instance

    def copy(
        self, name: Optional[str] = None, **node_parameters: Any
    ) -> "QualibrationNode[ParametersType]":
        """
        Creates a modified copy of the node with updated parameters.

        The method allows the user to update parameters and assign a new name.
        If a new name is not provided, the copied node retains the same name as
        the original.

        Args:
            name: A new name for the node. Defaults to None.
            node_parameters: Additional parameters for the copied node.

        Returns:
            A copied node with the new parameters and name.

        Raises:
            ValueError: If the name provided is not a string.
        """
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
        """
        Checks backend configuration and issues a warning if incompatible.

        Specifically, if the node is set to run in external mode and uses
        an interactive matplotlib backend, it switches to a non-interactive
        backend and logs a warning message.

        """
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
        """
        Returns the snapshot index from the storage manager.

        Retrieves the snapshot index that reflects the current state in
        the associated storage, if any.

        Returns:
            Snapshot index or None.
        """
        if self.storage_manager is None:
            return None
        return self.storage_manager.snapshot_idx

    def save(self) -> None:
        """
        Saves the current state of the node to the storage manager.

        If no storage manager is assigned, the method attempts to create
        a default configuration for storage and logs a warning message.

        Raises:
            ImportError: Raised if required configurations are not accessible.
        """
        if self.storage_manager is None:
            # TODO: fully depend on qualibrate. Need to remove this dependency.
            msg = (
                "Node.storage_manager should be defined to save node, "
                "resorting to default configuration"
            )
            logger.warning(msg)
            settings = get_qualibrate_app_settings()
            if settings is None:
                return
            self.storage_manager = LocalStorageManager(
                root_data_folder=settings.qualibrate.storage.location,
                active_machine_path=settings.active_machine.path,
            )
        self.storage_manager.save(
            node=cast("QualibrationNode[NodeParameters]", self)
        )

    def _load_from_id(
        self,
        node_id: int,
        base_path: Optional[Path] = None,
        custom_loaders: Optional[Sequence[type[BaseLoader]]] = None,
        build_params_class: bool = False,
    ) -> Optional["QualibrationNode[ParametersType]"]:
        if base_path is None:
            try:
                settings = get_qualibrate_app_settings(raise_ex=True)
            except ModuleNotFoundError as ex:
                # TODO: update error msg when settings
                #  will be resolved without q_app
                logger.exception(
                    "Failed to load qualibrate app settings", exc_info=ex
                )
                return None
            base_path = Path(settings.qualibrate.storage.location)  # type: ignore
        node_dir = get_node_dir_path(node_id, base_path)
        if node_dir is None:
            logger.error(
                f"Node directory with id {node_id} wasn't found in {base_path}"
            )
            return None
        node_content = read_node_content(node_dir, node_id, base_path)
        if node_content is not None:
            quam_machine, parameters = parse_node_content(
                node_content,
                node_id,
                node_dir,
                build_params_class,
            )
            if quam_machine is not None:
                self.machine = quam_machine
            if parameters is not None:
                if build_params_class:
                    self.parameters_class = cast(
                        ParametersType, parameters
                    ).__class__
                    self._parameters = cast(ParametersType, parameters)
                else:
                    self._parameters = self.parameters.model_construct(
                        **cast(Mapping[str, Any], parameters)
                    )

        data = read_node_data(node_dir, node_id, base_path, custom_loaders)
        if data is not None:
            self.results = data
        return self

    @InstanceOrClassMethod
    def load_from_id(
        caller: Union[
            "QualibrationNode[ParametersType]",
            type["QualibrationNode[ParametersType]"],
        ],
        node_id: int,
        base_path: Optional[Path] = None,
        custom_loaders: Optional[Sequence[type[BaseLoader]]] = None,
    ) -> Optional["QualibrationNode[ParametersType]"]:
        instance: QualibrationNode[ParametersType] = (
            caller(name=f"loaded_from_id_{node_id}")
            if isinstance(caller, type)
            else caller
        )
        return instance._load_from_id(
            node_id=node_id,
            base_path=base_path,
            custom_loaders=custom_loaders,
            build_params_class=isinstance(caller, type),
        )

    def _post_run(
        self,
        last_executed_node: "QualibrationNode[ParametersType]",
        created_at: datetime,
        initial_targets: Sequence[TargetType],
        parameters: NodeParameters,
        run_error: Optional[RunError],
    ) -> NodeRunSummary:
        """
        Finalizes the node's execution and creates a summary.

        This method updates the outcomes for the last executed node,
        generates a summary, and logs the summary details. It is used
        to encapsulate the results of the node run, including the error
        (if any), state changes, and outcomes for each target.

        Args:
            last_executed_node: The node that was last executed.
            created_at: The timestamp when the run started.
            initial_targets: Targets at the start of the run.
            parameters: Parameters used in the run.
            run_error: Details of any error that occurred.

        Returns:
            A summary object containing execution details.
        """
        outcomes = last_executed_node.outcomes
        if self.parameters is not None and (targets := self.parameters.targets):
            lost_targets_outcomes = set(targets) - set(outcomes.keys())
            outcomes.update(
                {target: Outcome.SUCCESSFUL for target in lost_targets_outcomes}
            )
        self.outcomes = last_executed_node.outcomes = {
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
    ) -> tuple["QualibrationNode[ParametersType]", BaseRunSummary]:
        """
        Runs the node with given parameters, potentially interactively.

        This function executes the node using parameters passed either
        directly or pre-configured in the node. It captures initial
        conditions, manages execution state, and logs errors or completion
        status.

        Args:
            interactive: Whether the node should be run interactively.
            **passed_parameters: Additional parameters to pass when
                running the node.

        Returns:
            The executed node and a summary of the run including outcomes,
            errors, and execution details.

        Raises:
            RuntimeError: Raised if the node filepath is not provided, or
                execution
        """
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

        if run_modes_ctx.get() is not None:
            logger.error(
                "Run modes context is already set to %s",
                run_modes_ctx.get(),
            )
        run_modes_token = run_modes_ctx.set(
            RunModes(external=True, interactive=interactive, inspection=False)
        )
        external_parameters_token = external_parameters_ctx.set(
            (self.name, parameters)
        )
        try:
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
            last_executed_node = last_executed_node_ctx.get()
            if last_executed_node is None:
                logger.warning(
                    f"Last executed node not set after running {self}"
                )
                last_executed_node = self

            run_summary = self._post_run(
                last_executed_node,
                created_at,
                initial_targets,
                parameters,
                run_error,
            )

        return last_executed_node, run_summary

    def run_node_file(self, node_filepath: Path) -> None:
        """
        Executes the provided node file.

        This method runs the code in the given node file, ensuring that
        any interactive backends are temporarily disabled during the
        execution to avoid conflicts. Once the file has been executed,
        the original matplotlib backend is restored.

        Args:
            node_filepath: Path to the file that contains the node's execution
                logic.
        """
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
        """
        Halts the execution of the node if currently running.

        The method attempts to connect to the node's machine and stops
        the running job. If the necessary environment or conditions are
        not present, it will return False.

        Args:
            **kwargs: Additional keyword arguments that might be used for
                stopping the node.

        Returns:
            True if the node is successfully stopped, False otherwise.
        """
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
        """
        Records state updates for the node during execution.

        This method wraps around node operations to record all state updates
        that occur, specifically during interactive execution. It uses
        custom `__setattr__` and `__setitem__` functions for relevant classes
        to record these changes.

        Args:
            interactive_only: Whether to only record in interactive mode.
                Defaults to True.

        Yields:
            None: Allows wrapped operations to execute while recording state
                updates.
        """
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
        except ImportError as ex:
            print(ex)
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
                cls.__setattr__ = partialmethod(
                    record_state_update_getattr, node=self
                )
            for cls in cls_setitem_funcs:
                cls.__setitem__ = partialmethod(
                    record_state_update_getitem, node=self
                )
            yield
        finally:
            for cls, setattr_func in cls_setattr_funcs.items():
                cls.__setattr__ = setattr_func
            for cls, setitem_func in cls_setitem_funcs.items():
                cls.__setitem__ = setitem_func

    @classmethod
    def scan_folder_for_instances(
        cls, path: Path
    ) -> dict[str, QRunnable[ParametersType, NodeRunParametersType]]:
        """
        Scans a directory for node instances and returns them.

        This method scans a folder to locate all node files that are valid
        instances of `QualibrationNode`. It sets an inspection mode to avoid
        executing the nodes during scanning.

        Args:
            path: The directory to scan for node files.

        Returns:
            A dictionary of node names to their corresponding node instances.
        """
        nodes: dict[str, QRunnable[ParametersType, NodeRunParametersType]] = {}
        if run_modes_ctx.get() is not None:
            logger.error(
                "Run modes context is already set to %s",
                run_modes_ctx.get(),
            )
        run_modes_token = run_modes_ctx.set(RunModes(inspection=True))
        try:
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
        cls,
        file: Path,
        nodes: dict[str, QRunnable[ParametersType, NodeRunParametersType]],
    ) -> None:
        """
        Scans a node file and adds its instance to the provided dictionary.

        This method scans the content of a given file to identify if it
        contains a valid `QualibrationNode`. If so, it adds the node to
        the given nodes dictionary for further processing.

        Args:
            file: The node file to scan.
            nodes: dictionary to add valid nodes to.

        Raises:
            StopInspection: Used to stop execution once inspection completes.
        """
        logger.info(f"Scanning node file {file}")
        try:
            # TODO Think of a safer way to execute the code
            _module = import_from_path(get_module_name(file), file)
        except StopInspection as ex:
            node = cast("QualibrationNode[ParametersType]", ex.instance)
            node.filepath = file
            node.modes.inspection = False
            cls.add_node(node, nodes)

    @classmethod
    def add_node(
        cls,
        node: "QualibrationNode[ParametersType]",
        nodes: dict[str, QRunnable[ParametersType, NodeRunParametersType]],
    ) -> None:
        """
        Adds a node instance to the node dictionary.

        If a node with the same name already exists in the dictionary,
        this method overwrites the existing entry with a warning.

        Args:
            node: The node instance to add.
            nodes: dictionary to store nodes.
        """
        if node.name in nodes:
            logger.warning(
                f'Node "{node.name}" already exists in library, overwriting'
            )

        nodes[node.name] = node


if __name__ == "__main__":
    from pathlib import Path

    # path = Path("/home/maxim_v4s/Downloads/")
    path = Path.home().joinpath(".qualibrate/user_storage/init_project")
    node = QualibrationNode.load_from_id(12)
    print(node.results)
    print(node.parameters)
