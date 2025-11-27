import copy
import traceback
from collections import defaultdict
from collections.abc import Callable, Generator, Mapping, Sequence
from contextvars import Token
from datetime import datetime
from inspect import isgeneratorfunction
from pathlib import Path
from types import TracebackType
from typing import (
    TYPE_CHECKING,
    Any,
    Generic,
    Literal,
    cast,
)

import networkx as nx
from pydantic import BaseModel, create_model
from typing_extensions import Self

from qualibrate.models.node_status import ElementRunStatus
from qualibrate.models.outcome import Outcome
from qualibrate.models.run_mode import RunModes
from qualibrate.models.run_summary.base import BaseRunSummary
from qualibrate.models.run_summary.graph import GraphRunSummary
from qualibrate.models.run_summary.run_error import RunError
from qualibrate.parameters import (
    ExecutionParameters,
    GraphElementsParameters,
    GraphParameters,
    NodeParameters,
    RunnableParameters,
)
from qualibrate.q_runnnable import (
    QRunnable,
    file_is_calibration_graph_instance,
    run_modes_ctx,
)
from qualibrate.qualibration_node import QualibrationNode
from qualibrate.runnables.runnable_collection import RunnableCollection
from qualibrate.utils.exceptions import (
    CyclicGraphError,
    StopInspection,
    TargetsFieldNotExist,
)
from qualibrate.utils.graph_building import (
    GraphElementTypeVar,
    GraphExportMixin,
    ensure_building,
    ensure_finalized,
    ensure_not_finalized,
)
from qualibrate.utils.logger_m import logger
from qualibrate.utils.read_files import get_module_name, import_from_path
from qualibrate.utils.type_protocols import MachineProtocol, TargetType

if TYPE_CHECKING:
    from qualibrate.orchestration.qualibration_orchestrator import (
        QualibrationOrchestrator,
    )
    from qualibrate.qualibration_library import QualibrationLibrary

__all__ = ["QGraphBaseType", "QualibrationGraph", "GraphElementTypeVar"]

GraphCreateParametersType = GraphParameters
GraphRunParametersType = ExecutionParameters
QGraphBaseType = QRunnable[GraphCreateParametersType, GraphRunParametersType]
NodeLibT = QualibrationNode[NodeParameters, MachineProtocol]
GraphElLibT = QRunnable[RunnableParameters, RunnableParameters]


class LoopCondition(BaseModel, Generic[GraphElementTypeVar]):
    on_failure: bool = False
    on_function: Callable[[GraphElementTypeVar, TargetType], bool] | None = None
    on_generator: (
        Callable[
            [],
            Generator[
                bool, tuple[GraphElementTypeVar, TargetType] | None, None
            ],
        ]
        | None
    ) = None
    max_iterations: int | None = None
    """
    Common amount for all loop types (on failure, on function, on generator)
    """


class QualibrationGraph(
    QRunnable[GraphCreateParametersType, GraphRunParametersType],
    GraphExportMixin[GraphElementTypeVar],
    Generic[GraphElementTypeVar],
):
    """
    Represents a graph of elements for calibration purposes.

    The `QualibrationGraph` class manages a directed graph composed of graph
    elements (both `QualibrationNode` and other `QualibrationGraph` instances)
    and containing reference to orchestrator for executing the entire graph. It
    supports defining connectivity, creating parameters for execution, and
    serializing the graph's state.

    Args:
        name (str): Name of the graph.
        parameters (GraphCreateParametersType): Parameters for creating the
            graph.
        nodes (Mapping[str, GraphElement]): A mapping of element names to
            graph elements (nodes or subgraphs).
        connectivity (Sequence[tuple[str, str]]): Adjacency list representing
            element connectivity as pairs of element names.
        orchestrator (Optional[QualibrationOrchestrator]): Orchestrator for the
            graph. Defaults to None.
        description (Optional[str]): Description of the graph. Defaults to None.
        modes (Optional[RunModes]): Modes to configure the graph behavior.
            Defaults to None.

    Raises:
        StopInspection: If the graph is instantiated in inspection mode.
    """

    EDGE_TARGETS_FIELD = "targets"
    ELEMENT_STATUS_FIELD = "status"
    LOOP_TARGETS_FIELD = "loop_targets"
    _node_init_args = {
        ELEMENT_STATUS_FIELD: ElementRunStatus.pending,
    }

    def __init__(
        self,
        name: str,
        parameters: GraphCreateParametersType,
        nodes: Mapping[str, GraphElementTypeVar] | None = None,
        connectivity: Sequence[tuple[str, str]] | None = None,
        orchestrator: (
            "QualibrationOrchestrator[GraphElementTypeVar] | None"
        ) = None,
        description: str | None = None,
        *,
        modes: RunModes | None = None,
        finalize: bool = True,
    ):
        if not isinstance(parameters, GraphParameters):
            raise ValueError("Graph parameters must be of type GraphParameters")
        super().__init__(name, parameters, description=description, modes=modes)
        self._connectivity: dict[tuple[str, str], Outcome]
        if finalize:
            if nodes is None or connectivity is None:
                raise RuntimeError(
                    "Nodes and connectivity must be defined on graph "
                    "instantiation."
                )
            self._elements = dict(nodes)
            self._connectivity = {
                connectivity: Outcome.SUCCESSFUL
                for connectivity in connectivity
            }
        else:
            self._elements = {}
            self._connectivity = {}
        self._graph: nx.DiGraph[GraphElementTypeVar] = nx.DiGraph()
        self._loop_conditions: dict[str, LoopCondition[GraphElementTypeVar]] = (
            defaultdict(LoopCondition)
        )
        if orchestrator is None:
            from qualibrate.orchestration.basic_orchestrator import (
                BasicOrchestrator,
            )

            orchestrator = BasicOrchestrator()
        self._orchestrator = orchestrator
        self._initial_targets: Sequence[TargetType] = []
        self._full_parameters_class: type[GraphRunParametersType] | None = None
        self._full_parameters: GraphRunParametersType | None = None
        self._building: bool = False
        self._finalized: bool = False

        if finalize:
            self.finalize()
        self.run_start = datetime.now().astimezone()

    def finalize(self) -> None:
        if self._finalized:
            return
        self._elements = self._validate_elements_names_mapping(self._elements)
        self._validate_no_elements_from_library(self._elements)
        self._add_nodes_and_connections_to_nx()
        self._full_parameters_class = self._build_parameters_class()
        self._full_parameters = self._full_parameters_class()
        self._finalized = True
        if self.modes.inspection:
            raise StopInspection(
                "Graph instantiated in inspection mode", instance=self
            )

    @property
    def _nodes(self) -> Mapping[str, GraphElementTypeVar]:
        """Get mapping of graph elements."""
        return self._elements

    @property
    @ensure_finalized
    def full_parameters_class(self) -> type[GraphRunParametersType]:
        if self._full_parameters_class is None:
            raise RuntimeError("Finalized graph has no full parameters class")
        return self._full_parameters_class

    @property
    @ensure_finalized
    def full_parameters(self) -> GraphRunParametersType:
        if self._full_parameters is None:
            raise RuntimeError(
                "Finalized graph has no full parameters instance"
            )
        return self._full_parameters

    def __copy__(self) -> Self:
        """
        Creates a shallow copy of the QualibrationGraph.

        This method ensures that the copied graph maintains all essential
        attributes, including nodes, connectivity, and parameters, while
        ensuring mutable objects like `_nodes` and `_graph` are copied
        appropriately.

        Returns:
            QualibrationGraph: A new QualibrationGraph instance with copied
                attributes.
        """
        # Create a new instance without calling __init__ directly
        cls = self.__class__
        new_graph = cls.__new__(cls)

        # Copy primitive attributes and immutable ones
        new_graph.name = self.name
        new_graph.parameters_class = self.parameters_class
        new_graph.description = self.description
        new_graph.filepath = self.filepath
        new_graph.modes = self.modes.model_copy()
        new_graph._full_parameters_class = self.full_parameters_class
        new_graph._full_parameters = self.full_parameters.model_copy(deep=True)
        new_graph._finalized = self._finalized
        new_graph._building = self._building

        if hasattr(self, "run_start"):
            new_graph.run_start = self.run_start

        # Copy mutable attributes
        new_graph._parameters = self.parameters.model_copy()
        new_graph._elements = {
            name: element.copy(name) for name, element in self._elements.items()
        }
        new_graph._connectivity = copy.deepcopy(self._connectivity)
        new_graph._loop_conditions = copy.deepcopy(self._loop_conditions)

        # Copy graph structure
        new_graph._graph = nx.DiGraph()
        new_graph._graph.add_nodes_from(new_graph._elements.values())
        for source, destination in self._connectivity:
            if (
                source in new_graph._elements
                and destination in new_graph._elements
            ):
                new_graph._graph.add_edge(
                    new_graph._elements[source],
                    new_graph._elements[destination],
                    scenario=self._connectivity[(source, destination)],
                )

        # Copy orchestrator if it exists
        new_graph._orchestrator = copy.copy(self._orchestrator)

        # Copy targets
        new_graph._initial_targets = copy.deepcopy(self._initial_targets)

        # copy runnable items
        new_graph._state_updates = copy.deepcopy(self._state_updates)
        new_graph.outcomes = copy.deepcopy(self.outcomes)
        new_graph.run_summary = (
            self.run_summary.model_copy(deep=True) if self.run_summary else None
        )

        return new_graph

    def _validate_graph_acyclic(self) -> None:
        """Check if directed nodes graph contains cycles.

        Raises:
            CyclicGraphError: There is a cycle in graph
        """
        try:
            cycle = nx.find_cycle(self._graph, orientation="original")
        except nx.NetworkXNoCycle:
            return
        node_names = tuple(
            [cycle[0][0].name, *[edge[1].name for edge in cycle]]
        )
        raise CyclicGraphError(
            f"Detected cycle in graph {self.name}: {node_names}",
        )

    def __repr__(self) -> str:
        return (
            f"{self.__class__.__name__}: {self.name} "
            f"(mode: {self.modes}; parameters: {self.full_parameters})"
        )

    def _add_nodes_and_connections_to_nx(self) -> None:
        """
        Adds graph elements and their connections to the internal graph
        representation.

        This method iterates over the registered elements and connectivity data
        to:
        - Add elements to the graph based on their names.
        - Add edges (connections) between elements if both elements exist.

        Raises:
            ValueError: If a connection references an element that has not been
                registered. The error message includes the offending element
                name and the available element names.
        """

        for element_name in self._elements:
            self._add_element_to_nx_by_name(element_name)

        for source, destination in self._connectivity:
            try:
                source_element = self._get_element_or_error(source)
                destination_element = self._get_element_or_error(destination)
            except ValueError as ex:
                issued_element_name = (
                    ex.args[1]
                    if len(ex.args) > 1
                    else f"{source} or {destination}"
                )
                raise ValueError(
                    f'Error creating QualibrationGraph "{self.name}": Could '
                    f"not add connection ({source}, {destination})"
                    f" because element with name "
                    f' "{issued_element_name}" has not been '
                    "registered. Available element names: "
                    f"{tuple(self._elements.keys())}"
                ) from ex
            if not self._graph.has_edge(source_element, destination_element):
                self._graph.add_edge(
                    source_element,
                    destination_element,
                    scenario=self._connectivity[(source, destination)],
                )
        self._validate_graph_acyclic()

    @staticmethod
    def _get_library() -> "QualibrationLibrary[NodeLibT, GraphElLibT]":
        from qualibrate.qualibration_library import QualibrationLibrary

        return QualibrationLibrary.get_active_library(create=False)

    @staticmethod
    def _validate_no_elements_from_library(
        nodes: Mapping[str, GraphElementTypeVar],
    ) -> None:
        library = QualibrationGraph._get_library()
        node_ids = set(id(node) for node in nodes.values())
        lib_node_ids = set(id(node) for node in library.nodes.values_nocopy())

        if len(node_ids.intersection(lib_node_ids)) > 0:
            raise RuntimeError(
                "Some nodes weren't copied before adding to graph"
            )

    @staticmethod
    def _validate_elements_names_mapping(
        elements: Mapping[str, GraphElementTypeVar],
    ) -> dict[str, GraphElementTypeVar]:
        """
        Validates the mapping of graph elements and ensures unique names.

        If the provided element names do not match the actual element names, a
        copy of the element is created with the correct name.

        Args:
            elements (Mapping[str, GraphElement]): Mapping of element names to
                graph elements (nodes or subgraphs).

        Returns:
            Mapping[str, GraphElement]: A valid mapping of element names to
                graph elements.
        """
        new_elements = {}
        for name, element in elements.items():
            if name != element.name:
                element = element.copy(name)
                logger.warning(
                    f"{element} has to be copied due to conflicting name "
                    f"({name})"
                )
            new_elements[name] = element
        return new_elements

    # TODO: logic commonly same with node so need to move to
    @classmethod
    def scan_folder_for_instances(
        cls, path: Path
    ) -> RunnableCollection[str, QGraphBaseType]:
        """
        Scans a folder for graph instances and returns them.

        This method scans the specified folder for graph files that represent
        valid instances of `QualibrationGraph`.

        Args:
            path (Path): The folder to scan for graph files.

        Returns:
            dict[str, QGraphBaseType]: A dictionary of graph names to their
                corresponding instances.
        """
        graphs: dict[str, QGraphBaseType] = {}
        run_modes_token: Token[RunModes | None] | None = None
        try:
            if run_modes_ctx.get() is not None:
                logger.error(
                    "Run modes context is already set to %s",
                    run_modes_ctx.get(),
                )
            run_modes_token = run_modes_ctx.set(RunModes(inspection=True))

            for file in sorted(path.iterdir()):
                if not file_is_calibration_graph_instance(file, cls.__name__):
                    continue
                try:
                    cls.scan_graph_file(file, graphs)
                except Exception as e:
                    logger.exception(
                        f"An error occurred on scanning graph file {file.name}",
                        exc_info=e,
                    )
        finally:
            if run_modes_token is not None:
                run_modes_ctx.reset(run_modes_token)
        return RunnableCollection(graphs)

    @classmethod
    def scan_graph_file(
        cls, file: Path, graphs: dict[str, QGraphBaseType]
    ) -> None:
        """
        Scans a graph file and adds its instance to the given dictionary.

        This method inspects the content of a given graph file and adds a valid
        `QualibrationGraph` to the provided dictionary.

        Args:
            file (Path): The file to scan for a graph.
            graphs (dict[str, QGraphBaseType]): The dictionary to add valid
                graphs to.

        Raises:
            StopInspection: Used to stop execution once inspection completes.
        """
        logger.info(f"Scanning graph file {file}")
        try:
            # TODO Think of a safer way to execute the code
            _module = import_from_path(get_module_name(file), file)
        except StopInspection as ex:
            graph = cast("QualibrationGraph[GraphElementTypeVar]", ex.instance)
            graph.filepath = file
            graph.modes.inspection = False
            cls.add_graph(graph, graphs)

    @classmethod
    def add_graph(
        cls,
        graph: "QualibrationGraph[GraphElementTypeVar]",
        graphs: dict[str, QGraphBaseType],
    ) -> None:
        """
        Adds a graph to the library dictionary.

        If a graph with the same name already exists, it overwrites it with
        a warning.

        Args:
            graph (QualibrationGraph): The graph to add.
            graphs (dict[str, QGraphBaseType]): The dictionary to store the
                graph.
        """
        if graph.name in graphs:
            logger.warning(
                f'Graph "{graph.name}" already exists in library, overwriting'
            )

        graphs[graph.name] = graph

    @ensure_finalized
    def cleanup(self) -> None:
        """
        Cleans up the graph and resets nodes to their initial states.

        This method is used to clear any progress made during execution by
        resetting nodes to their initial states.
        """
        super().cleanup()
        nx.set_node_attributes(
            self._graph,
            {node: self._node_init_args.copy() for node in self._graph.nodes},
        )
        for element in self._elements.values():
            element.cleanup()
        nx.remove_edge_attributes(
            self._graph, self.__class__.EDGE_TARGETS_FIELD
        )
        self._orchestrator.cleanup()

    def completed_count(self) -> int:
        """
        Returns the count of completed nodes in the graph.

        This method calculates how many nodes in the graph have been completed
        (i.e., they are no longer pending).

        Returns:
            int: The count of nodes that have been completed.
        """
        return int(
            sum(
                map(
                    lambda status: status != ElementRunStatus.pending,
                    nx.get_node_attributes(
                        self._graph, self.ELEMENT_STATUS_FIELD
                    ).values(),
                )
            )
        )

    @property
    def active_element(self) -> GraphElementTypeVar | None:
        return self._orchestrator.active_element

    @property
    def active_node(
        self,
    ) -> QualibrationNode[NodeParameters, MachineProtocol] | None:
        return self._orchestrator.active_node

    @property
    def active_node_name(self) -> str | None:
        return node.name if (node := self.active_node) is not None else None

    def _get_all_nodes_parameters(
        self, elements_parameters: Mapping[str, Any]
    ) -> Mapping[str, Any]:
        """
        Retrieves parameters for all elements, providing defaults if
        unspecified.

        This method extracts the parameters for each element in the graph.
        If parameters are missing for any element, it assigns default values.

        Args:
            elements_parameters (Mapping[str, Any]): dictionary containing
                parameters for nodes, keyed by node names.

        Returns:
            Mapping[str, Any]: A dictionary containing parameters for all nodes,
            ensuring that each node has a corresponding entry.
        """
        nodes_class = self.full_parameters_class.model_fields[
            "nodes"
        ].annotation
        return {
            name: elements_parameters.get(name, {})
            for name in cast(GraphElementsParameters, nodes_class).model_fields
        }

    def _mark_nodes_as_skipped(
        self, start_from: GraphElementTypeVar | str
    ) -> None:
        start_node = (
            self._elements[start_from]
            if isinstance(start_from, str)
            else start_from
        )
        bfs_tree = nx.bfs_tree(self._graph, start_node)
        difference = set(self._graph.nodes).difference(set(bfs_tree.nodes))
        for node in difference:
            self._graph.nodes[node][self.__class__.ELEMENT_STATUS_FIELD] = (
                ElementRunStatus.skipped
            )

    def _run(
        self,
        *,
        start_from: GraphElementTypeVar | str | None = None,
        nodes: Mapping[str, Any],
        **passed_parameters: Any,
    ) -> None:
        """
        Runs the graph by traversing nodes using the orchestrator.

        This method performs the actual execution of the graph by validating
        the passed parameters and invoking the orchestrator to traverse through
        the graph.

        Args:
            nodes (Mapping[str, Any] | None): The parameters for runnable
                elements.
            **passed_parameters (Any): Parameters passed for graph execution.
        """
        orchestrator = self._orchestrator
        self.cleanup()
        nodes = self._get_all_nodes_parameters(nodes)
        self._parameters = self.parameters.model_validate(passed_parameters)
        self._full_parameters = self.full_parameters_class.model_validate(
            {"parameters": self.parameters, "nodes": nodes}
        )
        targets = self._initial_targets = (
            self.full_parameters.parameters.targets or []
        )
        nodes_parameters_model = self.full_parameters.nodes
        for node_name in nodes_parameters_model.model_fields_set:
            node_parameters_model = getattr(nodes_parameters_model, node_name)
            if node_parameters_model.targets_name is not None:
                try:
                    node_parameters_model.targets = targets
                except TargetsFieldNotExist as ex:
                    targets_name = node_parameters_model.targets_name
                    msg = (
                        f'Unable to run node "{node_name}" within graph '
                        f'"{self.name}". The node is unable to locate the '
                        "targets parameter "
                        f'"{targets_name}". Please either add '
                        f"node.parameters.{targets_name}, or alternatively set "
                        f"a different targets parameter using "
                        f'node.parameters.targets_name = "targets_name"'
                    )
                    raise TargetsFieldNotExist(msg) from ex
        if start_from is not None:
            self._mark_nodes_as_skipped(start_from)
        orchestrator.traverse_graph(self, targets)

    def _post_run(
        self,
        created_at: datetime,
        run_error: RunError | None,
    ) -> GraphRunSummary:
        """
        Finalizes the graph execution and generates a summary.

        This method updates the outcomes of the graph, creates a summary
        with information about the execution, including successful and failed
        targets, and logs the summary.

        Args:
            created_at (datetime): Timestamp when the graph run was started.
            run_error (Optional[RunError]): Details of any error encountered
                during execution.

        Returns:
            GraphRunSummary: A summary object containing details about the
                graph run.
        """
        self.outcomes = self._orchestrator.final_outcomes
        self.run_summary = GraphRunSummary(
            name=self.name,
            description=self.description,
            created_at=created_at,
            completed_at=datetime.now().astimezone(),
            parameters=self.full_parameters,
            outcomes=self.outcomes,
            initial_targets=self._initial_targets,
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
        logger.debug(f"Graph run summary {self.run_summary}")
        return self.run_summary

    @ensure_finalized
    def run(
        self,
        /,
        *,
        start_from: GraphElementTypeVar | str | None = None,
        interactive: bool = False,
        nodes: Mapping[str, Any] | None = None,
        **passed_parameters: Any,
    ) -> BaseRunSummary:
        """
        Runs the graph using the given parameters.

        This method orchestrates the execution of all nodes in the graph,
        following the specified connectivity and using the provided parameters.

        Args:
            start_from (GraphElementTypeVar | str | None): Start traverse from
                specific node.
            interactive (bool): just for same api with Node.run.
            nodes (Mapping[str, Any] | None): The parameters for runnable
                elements.
            **passed_parameters (Any): Graph parameters to use for the
                execution. Should include the `nodes` key.

        Returns:
            tuple[QualibrationGraph, BaseRunSummary]: The graph and a summary of
            the execution, including outcomes and other details.

        Raises:
            RunError: If any error occurs during graph execution.
        """
        logger.info(
            f"Run graph {self.name} with parameters: {passed_parameters}"
        )
        self.run_start = datetime.now().astimezone()
        run_error: RunError | None = None
        if nodes is None:
            nodes = {}
        try:
            self._run(start_from=start_from, nodes=nodes, **passed_parameters)
        except Exception as ex:
            run_error = RunError(
                error_class=ex.__class__.__name__,
                message=str(ex),
                traceback=traceback.format_tb(ex.__traceback__),
            )
            raise
        finally:
            run_summary = self._post_run(self.run_start, run_error)
        return run_summary

    def _get_element_or_error(self, element_name: str) -> GraphElementTypeVar:
        """
        Retrieves a graph element by name or raises an error if the element is
        not found.

        This method fetches an element from the graph using the given name.
        If the element is not found in the graph, an error is raised.

        Args:
            element_name (str): The name of the element to retrieve.

        Returns:
            GraphElement: The element associated with the given name.

        Raises:
            ValueError: If no element with the specified name exists.
        """
        element = self._elements.get(element_name)
        if element is None:
            raise ValueError(
                f"Unknown element with name {element_name}", element_name
            )
        return element

    def _add_element_to_nx_by_name(
        self, element_name: str
    ) -> GraphElementTypeVar:
        """
        Adds a graph element to the graph by name, if not already present.

        This method adds the element identified by `element_name` to the graph,
        including initializing it with default attributes.

        Args:
            element_name (str): The name of the element to add.

        Returns:
            GraphElement: The element that was added or already exists in the
                graph.
        """
        element = self._get_element_or_error(element_name)
        if element not in self._graph:
            self._graph.add_node(element, **self.__class__._node_init_args)
        return element

    def _build_parameters_class(self) -> type[GraphRunParametersType]:
        """
        Builds a class for the parameters used in running the graph.

        This method dynamically creates a model class that combines the
        parameters for the graph itself and its nodes, to be used during the
        graph's execution.

        Returns:
            The parameter class to be used for
                execution.
        """

        elements_parameters_class = create_model(
            "GraphElementsParameters",
            __base__=GraphElementsParameters,
            **{  # type: ignore
                element.name: (
                    (element.full_parameters_class, element.full_parameters)
                    if isinstance(element, QualibrationGraph)
                    else (element.parameters_class, element.parameters)
                )
                for element in self._graph.nodes
            },
        )
        execution_parameters_class = create_model(
            "ExecutionParameters",
            __base__=ExecutionParameters,
            parameters=(self.parameters.__class__, self.parameters),
            nodes=(elements_parameters_class, elements_parameters_class()),
        )
        return execution_parameters_class

    @ensure_finalized
    def serialize(self, /, **kwargs: Any) -> Mapping[str, Any]:
        return self.__serialize_data(**kwargs)

    @ensure_finalized
    def serialize_graph_representation(self) -> Mapping[str, Any]:
        identifier = 1

        def __serialize_graph_represantation_inner(
            graph_self: "QualibrationGraph[Any]",
        ) -> Mapping[str, Any]:
            flow_dict = defaultdict(list)
            nonlocal identifier
            nx_data = dict(
                graph_self.__class__.nx_graph_export(
                    graph_self._graph, node_names_only=True
                )
            )

            nodes_raw = nx_data.pop("nodes")
            adj_raw = nx_data.pop("adjacency")

            name_identifier_dict = {}
            for node in nodes_raw:
                node_id = identifier
                identifier += 1
                node_name = node["id"]
                name_identifier_dict[node_name] = node_id

            for node, adjacency in zip(nodes_raw, adj_raw, strict=False):
                node_name = node["id"]
                node_id = name_identifier_dict[node_name]

                element = graph_self._elements[node_name]
                subgraph_data = {}

                if isinstance(element, QualibrationGraph):
                    subgraph_data["subgraph"] = (
                        __serialize_graph_represantation_inner(element)
                    )

                flow_dict["nodes"].append(
                    {
                        "id": node_id,
                        "data": {"label": node_name, **subgraph_data},
                    }
                )

                for adj in adjacency:
                    target_name = adj["id"]

                    flow_dict["edges"].append(
                        {
                            "id": f"{node_id}->"
                            f"{name_identifier_dict[target_name]}",
                            "source": node_id,
                            "target": name_identifier_dict[target_name],
                            "data": {
                                "condition": adj.get(
                                    "scenario", Outcome.SUCCESSFUL
                                )
                                == Outcome.SUCCESSFUL,
                            },
                        }
                    )

            return dict(flow_dict)

        return __serialize_graph_represantation_inner(self)

    def __serialize_data(self, /, **kwargs: Any) -> Mapping[str, Any]:
        """
        Serializes the graph into a dictionary format.

        This method provides a JSON-serializable representation of the graph,
        including nodes, parameters, connectivity, orchestrator.

        Args:
            **kwargs (Any): Additional arguments for serialization.

        Keyword Args:
            cytoscape (bool): Is it needed to include cytoscape information.
                Defaults to `False`.
        Returns:
            Mapping[str, Any]: Serialized representation of the graph.
        """
        data = dict(super().serialize())
        cytoscape = bool(kwargs.get("cytoscape", False))
        parameters = self.full_parameters_class.serialize(**kwargs)
        nx_data: dict[str, Any] = dict(
            self.__class__.nx_graph_export(self._graph, node_names_only=True)
        )
        data.update(
            {
                "parameters": parameters["parameters"],
                "orchestrator": (
                    self._orchestrator.serialize()
                    if self._orchestrator is not None
                    else None
                ),
            }
        )
        nodes = {}
        connectivity = []
        for node, adjacency in zip(
            nx_data.pop("nodes"), nx_data.pop("adjacency"), strict=False
        ):
            node_id = node["id"]
            nodes[node_id] = node
            element = self._elements[node_id]
            # TODO: simplify node name
            additional: dict[str, Any] = {"name": node_id}
            if isinstance(element, QualibrationGraph):
                additional.update(element.__serialize_data(**kwargs))
            else:
                additional["parameters"] = parameters["nodes"][node["id"]]
            node.update(additional)
            connectivity.extend([(node_id, item["id"]) for item in adjacency])
        data.update({"nodes": nodes, "connectivity": connectivity})
        if cytoscape:
            data["cytoscape"] = self.__class__.cytoscape_representation(data)
        return data

    @ensure_finalized
    def stop(self, /, **kwargs: Any) -> bool:
        """
        Stops the execution of the graph or nodes within it.

        This method stops the orchestrator associated with the graph and
        optionally stops any active nodes.

        Args:
            **kwargs (Any): Additional arguments.

        Keyword Args:
            stop_graph_node (bool): Is it needed to stop running node.

        Returns:
            bool: True if successful in stopping execution, False otherwise.
        """
        logger.debug(f"Stop graph {self.name}")
        stop_node: bool | None = kwargs.get("stop_graph_node")
        node_stop = True
        orchestrator = self._orchestrator
        if orchestrator is None:
            return False
        if stop_node and (node := orchestrator.active_node):
            node_stop = node.stop()
        orchestrator.stop()
        return node_stop

    @ensure_finalized
    def copy(self, /, name: str | None = None, **node_parameters: Any) -> Self:
        new_graph = self.__copy__()
        if name is not None:
            new_graph.name = name
        # TODO: passed parameters
        return new_graph

    # --- Build API ---
    @classmethod
    def build(
        cls,
        name: str,
        *,
        parameters: GraphCreateParametersType | None = None,
        orchestrator: (
            "QualibrationOrchestrator[GraphElementTypeVar] | None"
        ) = None,
    ) -> "QualibrationGraph[GraphElementTypeVar]":
        """
        Create an empty graph instance ready to be used as a context manager.
        """

        g = cls(
            name=name,
            parameters=parameters or GraphParameters(),
            orchestrator=orchestrator,
            finalize=False,  # we will finalize on __exit__
        )
        return g

    @ensure_not_finalized
    def __enter__(self) -> Self:
        self._building = True
        modes = run_modes_ctx.get() or RunModes()
        self.__run_context_token = run_modes_ctx.set(
            modes.model_copy(update={"inspection": False})
        )
        return self

    def __exit__(
        self,
        exc_type: type[BaseException] | None,
        exc: BaseException | None,
        tb: TracebackType | None,
    ) -> Literal[False]:
        self._building = False
        run_modes_ctx.reset(self.__run_context_token)
        if exc_type is not None:
            # propagate exceptions from inside the block
            return False

        # finalize on successful exit
        self.finalize()
        return False

    @ensure_not_finalized
    @ensure_building
    def add_node(
        self,
        node: GraphElementTypeVar,
        *,
        lib: "QualibrationLibrary[NodeLibT, GraphElLibT] | None" = None,
    ) -> None:
        key = node.name
        if key in self._elements:
            raise ValueError(f"Node '{key}' already exists.")
        if lib is None:
            lib = self._get_library()
        if node in lib.nodes.values_nocopy():
            raise ValueError(
                f"Node '{key}' is generic from library. "
                f"Please create copy of it before adding it."
            )
        if node in self._elements.values():
            raise ValueError(
                f"Node '{key}' already exists. "
                f"You need to create a copy if you want to add same."
            )
        self._elements[key] = node

    @ensure_not_finalized
    @ensure_building
    def add_nodes(self, *nodes: GraphElementTypeVar) -> None:
        for node in nodes:
            self.add_node(node)

    def _resolve_element_name(self, x: str | GraphElementTypeVar) -> str:
        if isinstance(x, str):
            return x
        x_id = id(x)
        element = next(
            filter(lambda i: id(i[1]) == x_id, self._elements.items()), None
        )
        return element[0] if element else x.name

    @ensure_not_finalized
    @ensure_building
    def connect(
        self,
        /,
        src: str | GraphElementTypeVar,
        dst: str | GraphElementTypeVar,
    ) -> None:
        self._connect(src, dst, Outcome.SUCCESSFUL)

    @ensure_not_finalized
    @ensure_building
    def connect_on_failure(
        self,
        /,
        src: str | GraphElementTypeVar,
        dst: str | GraphElementTypeVar,
    ) -> None:
        self._connect(src, dst, Outcome.FAILED)

    @ensure_not_finalized
    @ensure_building
    def _connect(
        self,
        src: str | GraphElementTypeVar,
        dst: str | GraphElementTypeVar,
        run_scenario: Outcome,
    ) -> None:
        s = self._resolve_element_name(src)
        d = self._resolve_element_name(dst)
        if s not in self._elements or d not in self._elements:
            raise KeyError(
                f"Both '{s}' and '{d}' must be added before connecting."
            )
        edge = (s, d)
        if edge in self._connectivity:
            return
        self._connectivity[edge] = run_scenario

    def _get_validated_element_name(
        self, element: str | GraphElementTypeVar
    ) -> str:
        element_name = element if isinstance(element, str) else element.name
        if element_name not in self._elements:
            raise KeyError(f"Element with name '{element}' not found.")
        return element_name

    @ensure_not_finalized
    @ensure_building
    def loop(
        self,
        /,
        element: str | GraphElementTypeVar,
        on: (
            Callable[
                [],
                Generator[
                    bool, tuple[GraphElementTypeVar, TargetType] | None, None
                ],
            ]
            | Callable[[GraphElementTypeVar, TargetType], bool]
            | None
        ) = None,
        max_iterations: int | None = None,
    ) -> None:
        if on is None and max_iterations is None:
            raise ValueError(
                "Either 'on' or 'max_iterations' must be specified (or both)."
            )
        element_name = self._get_validated_element_name(element)
        conditions = self._loop_conditions
        if max_iterations is not None:
            conditions[element_name].max_iterations = max_iterations
        if on is not None:
            if isgeneratorfunction(on):
                conditions[element_name].on_generator = on
            else:
                conditions[element_name].on_function = cast(
                    Callable[[GraphElementTypeVar, TargetType], bool], on
                )

    def _loop_on_failure(
        self, element: str | GraphElementTypeVar, max_iterations: int
    ) -> None:
        """protected for internal use"""
        element_name = self._get_validated_element_name(element)
        conditions = self._loop_conditions[element_name]
        conditions.max_iterations = max_iterations
        conditions.on_failure = True
