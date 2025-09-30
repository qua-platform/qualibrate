import copy
import inspect
import sys
import traceback
from collections.abc import Generator, Mapping, Sequence
from contextlib import contextmanager
from datetime import datetime
from pathlib import Path
from typing import (
    Any,
    Generic,
    Optional,
    TypeVar,
    Union,
    cast,
)

if sys.version_info < (3, 11):
    from typing_extensions import Self
else:
    from typing import Self

import matplotlib
import matplotlib.pyplot as plt
from matplotlib.backends import (  # type: ignore[attr-defined]
    BackendFilter,
    backend_registry,
)
from pydantic import ValidationError, create_model
from qualibrate_config.resolvers import (
    get_qualibrate_config,
    get_qualibrate_config_path,
)

from qualibrate.config.resolvers import get_quam_state_path
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
from qualibrate.runnables.run_action.action import ActionCallableType
from qualibrate.runnables.run_action.action_manager import (
    ActionDecoratorType,
    ActionManager,
)
from qualibrate.runnables.runnable_collection import RunnableCollection
from qualibrate.storage import StorageManager
from qualibrate.storage.local_storage_manager import LocalStorageManager
from qualibrate.utils.exceptions import StopInspection
from qualibrate.utils.logger_m import (
    ALLOWED_LOG_LEVEL_NAMES,
    LOG_LEVEL_NAMES_TYPE,
    logger,
)
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
from qualibrate.utils.node.record_state_update import update_node_machine
from qualibrate.utils.read_files import get_module_name, import_from_path
from qualibrate.utils.type_protocols import MachineProtocol, TargetType

__all__ = [
    "QualibrationNode",
    "NodeCreateParametersType",
    "NodeRunParametersType",
]

NodeCreateParametersType = NodeParameters
NodeRunParametersType = NodeParameters
ParametersType = TypeVar("ParametersType", bound=NodeParameters)
MachineType = TypeVar("MachineType", bound=MachineProtocol)


class QualibrationNode(
    QRunnable[ParametersType, ParametersType],
    Generic[ParametersType, MachineType],
):
    """
    Represents a qualibration node (that can be run independently or as part
    of graph), responsible for executing specific tasks with defined parameters
     and modes.

    Args:
        name: The name of the node. If not provided, the name will be the name
            of the file that contains the node.
        parameters: Parameters passed to the node for its initialization.
            Defaults to None.
        description: A description of the node. Defaults to None.
        parameters_class: Class used for node parameters validation. Defaults
            to None.
        modes: Execution modes. Defaults to None.

    Raises:
        StopInspection: Raised if the node is instantiated in inspection mode.
    """

    active_node: Optional["QualibrationNode[ParametersType, Any]"] = None

    def __new__(
        cls, *args: Any, **kwargs: Any
    ) -> "QualibrationNode[ParametersType, Any]":
        if cls.active_node is not None:
            return cls.active_node
        return super().__new__(cls)

    def __init__(
        self,
        name: str | None = None,
        parameters: ParametersType | None = None,
        description: str | None = None,
        *,
        parameters_class: type[ParametersType] | None = None,
        modes: RunModes | None = None,
    ):
        if self.__class__.active_node is not None:
            return
        name = name or self.__class__._get_name_from_stack_frame()
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
        # class is used just for passing reference to the running instance
        self._fraction_complete = 0.0
        self.results: dict[Any, Any] = {}
        self.machine: MachineType | None = None
        self.storage_manager: StorageManager[Self] | None = None

        # Initialize the ActionManager to handle run_action logic.
        self._action_manager = ActionManager()
        self.namespace: dict[str, Any] = {}
        if self.modes.inspection:
            raise StopInspection(
                "Node instantiated in inspection mode", instance=self
            )
        self._post_init()

    @staticmethod
    def _get_name_from_stack_frame() -> str:
        stack = inspect.stack()
        if not len(stack) or len(stack) < 3:
            raise ValueError("Can't resolve node name from node filename")
        frame = stack[2]
        return Path(frame.filename).stem

    def _post_init(self) -> None:
        self.run_start = datetime.now().astimezone()
        self.last_saved_at: datetime | None = None
        self._custom_action_label: str | None = None
        self._get_storage_manager()

        self._warn_if_external_and_interactive_mpl()

    @classmethod
    def _validate_passed_parameters_options(
        cls,
        name: str,
        parameters: ParametersType | None,
        parameters_class: type[ParametersType] | None,
    ) -> ParametersType:
        """
        Validates passed parameters and parameters class.

        If parameters
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
        params_type_error = ValueError(
            "Node parameters must be of type NodeParameters"
        )
        if parameters is not None:
            if not isinstance(parameters, NodeParameters):
                raise params_type_error
            if parameters_class is not None:
                logger.warning(
                    "Passed both parameters and parameters_class to the node "
                    f"'{name}'. Please use only parameters argument"
                )
            return parameters
        if parameters_class is None:
            fields = {
                name: copy.copy(field)
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
        if not issubclass(parameters_class, NodeParameters):
            raise params_type_error
        try:
            return parameters_class()
        except ValidationError as e:
            raise ValueError(
                f"Can't instantiate parameters class of node '{name}'"
            ) from e

    @property
    def action_label(self) -> str | None:
        if self._custom_action_label is not None:
            return self._custom_action_label
        return self.current_action_name

    @action_label.setter
    def action_label(self, value: str | None) -> None:
        self._custom_action_label = value

    def __copy__(self) -> Self:
        """
        Creates a shallow copy of the node.

        This method copies the node, including its parameters, name, modes,
        and filepath, while resetting inspection-related modes to maintain
        consistency.

        Returns:
            A copy of the node.
        """
        modes = self.modes.model_copy(update={"inspection": False})
        active_node = self.__class__.active_node
        try:
            self.__class__.active_node = None
            instance = self.__class__(
                self.name,
                self.parameters_class(),
                self.description,
                modes=modes,
            )
            instance.modes.inspection = self.modes.inspection
            instance.filepath = self.filepath
            return instance
        finally:
            self.__class__.active_node = active_node

    def copy(self, name: str | None = None, **node_parameters: Any) -> Self:
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
        # Base class is inherited from user passed model so don't use passed
        # class as base for copied parameters class
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
        if self.modes.external and mpl_backend in cast(
            list[str],
            backend_registry.list_builtin(BackendFilter.INTERACTIVE),  # type: ignore[no-untyped-call]
        ):
            plt.close("all")
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
    def snapshot_idx(self) -> int | None:
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

    def run_action(
        self,
        func: ActionCallableType | None = None,
        *,
        skip_if: bool = False,
    ) -> ActionDecoratorType:
        """
        Convenience method that returns the run_action decorator
        provided by the ActionManager.

        Usage examples:

            @node.run_action
            def action1(node):
                # action code

            @node.run_action(skip_if=True)
            def action2(node):
                # action code; this action is skipped if
                # skip_if is True.
        """
        return self._action_manager.register_action(self, func, skip_if=skip_if)

    def _get_storage_manager(self) -> StorageManager[Self]:
        if self.storage_manager is not None:
            return self.storage_manager
        q_config_path = get_qualibrate_config_path()
        qs = get_qualibrate_config(q_config_path)
        state_path = get_quam_state_path(qs)
        self.storage_manager = LocalStorageManager[Self](
            root_data_folder=qs.storage.location,
            active_machine_path=state_path,
        )
        self.storage_manager.get_snapshot_idx(self)
        return self.storage_manager

    def save(self) -> None:
        """
        Saves the current state of the node to the storage manager.

        If no storage manager is assigned, the method attempts to create
        a default configuration for storage and logs a warning message.

        Raises:
            ImportError: Raised if required configurations are not accessible.
        """
        self._get_storage_manager().save(node=self)
        self.last_saved_at = datetime.now().astimezone()

    def _load_from_id(
        self,
        node_id: int,
        base_path: Path | None = None,
        custom_loaders: Sequence[type[BaseLoader]] | None = None,
        build_params_class: bool = False,
    ) -> Self | None:
        """
        Loads a node by its identifier, parsing its content and data.

        Args:
            node_id: The unique identifier of the node.
            base_path: The base directory where node data is stored. If None,
                attempts to retrieve the path from qualibrate app settings.
            custom_loaders: An optional sequence of custom loader classes
                for handling specific file types.
            build_params_class: Whether to dynamically build a parameters class
                based on the node schema.

        Returns:
            The current `QualibrationNode` instance with the loaded data,
            or None if loading fails.
        """
        if base_path is None:
            q_config_path = get_qualibrate_config_path()
            qs = get_qualibrate_config(q_config_path)
            base_path = qs.storage.location
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
                    self._parameters = cast(
                        ParametersType,
                        self.parameters.model_construct(
                            **cast(Mapping[str, Any], parameters)
                        ),
                    )

        data = read_node_data(node_dir, node_id, base_path, custom_loaders)
        if data is not None:
            self.results = data
        return self

    @InstanceOrClassMethod
    def load_from_id(
        caller: Union[
            "QualibrationNode[ParametersType, MachineType]",
            type["QualibrationNode[ParametersType, MachineType]"],
        ],
        node_id: int,
        base_path: Path | None = None,
        custom_loaders: Sequence[type[BaseLoader]] | None = None,
    ) -> Optional["QualibrationNode[ParametersType, MachineType]"]:
        """
        Class or instance method to load a node by its identifier.

        Args:
            caller: The class or instance calling this method. If called on
                a class, creates a new instance; otherwise, modifies the
                existing instance.
            node_id: The unique identifier of the node.
            base_path: The base directory where node data is stored. If None,
                attempts to retrieve the path from qualibrate app settings.
            custom_loaders: An optional sequence of custom loader classes
                for handling specific file types.

        Returns:
            A `QualibrationNode` instance with the loaded data, or None if
            loading fails.
        """
        instance: QualibrationNode[ParametersType, MachineType] = (
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
        initial_targets: Sequence[TargetType],
        parameters: NodeParameters,
        run_error: RunError | None,
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
        outcomes = self.outcomes
        self._action_manager.current_action = None
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
            created_at=self.run_start,
            completed_at=datetime.now().astimezone(),
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
        self,
        interactive: bool = False,
        *,
        skip_actions: bool | Sequence[str] = False,
        **passed_parameters: Any,
    ) -> BaseRunSummary:
        """
        Runs the node with given parameters, potentially interactively.

        This function executes the node using parameters passed either
        directly or pre-configured in the node. It captures initial
        conditions, manages execution state, and logs errors or completion
        status.

        Args:
            interactive: Whether the node should be run interactively.
            skip_actions: An optional sequence of actions to skip when running.
                Also, possible to pass `True` to skip all actions.
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
        self._fraction_complete = 0
        if self.filepath is None:
            ex = RuntimeError(f"Node {self.name} file path was not provided")
            logger.exception("", exc_info=ex)
            raise ex
        params_dict = (
            self.parameters.model_dump() if self.parameters is not None else {}
        )
        params_dict.update(passed_parameters)
        parameters = self.parameters.model_validate(params_dict)
        initial_targets = (
            copy.copy(parameters.targets) if parameters.targets else []
        )
        self.run_start = datetime.now().astimezone()
        run_error: RunError | None = None

        if run_modes_ctx.get() is not None:
            logger.error(
                "Run modes context is already set to %s",
                run_modes_ctx.get(),
            )
        new_run_modes = RunModes(
            external=True, interactive=interactive, inspection=False
        )
        run_modes_token = run_modes_ctx.set(new_run_modes)
        modes = self.modes.model_copy()
        try:
            self._parameters = parameters
            self.modes = new_run_modes
            self.__class__.active_node = self
            self._action_manager.skip_actions = skip_actions

            self.run_node_file(self.filepath)
        except Exception as ex:
            run_error = RunError(
                error_class=ex.__class__.__name__,
                message=str(ex),
                traceback=traceback.format_tb(ex.__traceback__),
            )
            logger.exception(f"Failed to run node {self.name}", exc_info=ex)
            raise
        else:
            self._fraction_complete = 1.0
        finally:
            self._action_manager.skip_actions = False
            run_modes_ctx.reset(run_modes_token)
            self.modes = modes
            self.__class__.active_node = None
            run_summary = self._post_run(
                initial_targets,
                parameters,
                run_error,
            )

        return run_summary

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
            plt.close("all")
            matplotlib.use("agg")
            _module = import_from_path(
                get_module_name(node_filepath), node_filepath
            )
        finally:
            matplotlib.use(mpl_backend)

    def stop(self, **kwargs: Any) -> bool:
        """
        Halts the execution of the node if currently running.

        The method attempts to get the qm job from namespace and halt
        got job. Also ship all subsequent run actions.

        Args:
            **kwargs: Additional keyword arguments that might be used for
                stopping the node.

        Returns:
            True if the node is successfully stopped, False otherwise.
        """
        active_node = self.__class__.active_node
        if active_node is None:
            logger.warning("No active node to stop")
            return False
        logger.info(f"Trying to stop node {active_node.name}")
        job = self.namespace.get("job")
        if job is not None and callable(getattr(job, "halt", None)):
            job.halt()
        active_node._action_manager.skip_actions = True
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
        Only simple types updates (int, float, bool, str and None) will
        be recorded.

        Args:
            interactive_only: Whether to only record in interactive mode.
                Defaults to True.

        Yields:
            None: Allows wrapped operations to execute while recording state
                updates.
        """
        machine = self.machine
        if not self.modes.interactive and interactive_only:
            yield
            return

        if machine is None or not hasattr(machine, "to_dict"):
            self.log(
                (
                    "Unable to perform `QualibrationNode."
                    "record_state_updates()` because `node.machine` has not "
                    "been set. Any changes will be automatically applied."
                ),
                level="warning",
            )
            yield
            return

        logger.debug(f"Init recording state updates for node {self.name}")
        original_dict = machine.to_dict(include_defaults=True)
        yield
        updated_dict = machine.to_dict(include_defaults=True)
        update_node_machine(self, original_dict, updated_dict)

    @classmethod
    def scan_folder_for_instances(
        cls, path: Path
    ) -> RunnableCollection[str, QRunnable[ParametersType, ParametersType]]:
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
        nodes: dict[str, QRunnable[ParametersType, ParametersType]] = {}
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
                    logger.warning(
                        "An error occurred on scanning node file "
                        f"{file.name}.\nError: {type(e)}: {e}"
                    )

        finally:
            run_modes_ctx.reset(run_modes_token)
        return RunnableCollection(nodes)

    @classmethod
    def scan_node_file(
        cls,
        file: Path,
        nodes: dict[str, QRunnable[ParametersType, ParametersType]],
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
            node = cast("QualibrationNode[ParametersType, Any]", ex.instance)
            node.filepath = file
            node.modes.inspection = False
            cls.add_node(node, nodes)

    @classmethod
    def add_node(
        cls,
        node: "QualibrationNode[ParametersType, MachineType]",
        nodes: dict[str, QRunnable[ParametersType, ParametersType]],
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

    def log(
        self,
        msg: object,
        *args: Any,
        level: LOG_LEVEL_NAMES_TYPE | int = "info",
        **kwargs: Any,
    ) -> None:
        name = self.name if len(self.name) <= 20 else f"{self.name[:17]}..."
        new_message = f"Node {name} - {msg}"
        if isinstance(level, int):
            logger.log(level, new_message, *args, **kwargs)
            return
        if level not in ALLOWED_LOG_LEVEL_NAMES:
            raise ValueError("Invalid log level name. Can't write log message.")
        getattr(logger, level)(new_message, *args, **kwargs)

    @property
    def fraction_complete(self) -> float:
        return self._fraction_complete

    @fraction_complete.setter
    def fraction_complete(self, value: float) -> None:
        self._fraction_complete = max(min(value, 1.0), 0.0)

    @property
    def current_action_name(self) -> str | None:
        action = self._action_manager.current_action
        return action.name if action else None


if __name__ == "__main__":
    from pathlib import Path

    # path = Path("/home/maxim_v4s/Downloads/")
    path = Path.home().joinpath(".qualibrate/user_storage/init_project")
    node = QualibrationNode.load_from_id(12)
    print(node.results)
    print(node.parameters)
