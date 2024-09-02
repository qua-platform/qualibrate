import warnings
from datetime import datetime
from enum import Enum
from pathlib import Path
from typing import (
    TYPE_CHECKING,
    Any,
    Callable,
    Dict,
    Mapping,
    Optional,
    Sequence,
    Tuple,
    Type,
    Union,
    cast,
)
from weakref import ReferenceType

import networkx as nx
from pydantic import create_model

from qualibrate.outcome import Outcome
from qualibrate.parameters import (
    ExecutionParameters,
    GraphParameters,
    NodesParameters,
)
from qualibrate.q_runnnable import QRunnable, file_is_calibration_instance
from qualibrate.qualibration_node import QualibrationNode
from qualibrate.run_summary.base import BaseRunSummary
from qualibrate.run_summary.graph import GraphRunSummary
from qualibrate.storage.local_storage_manager import logger
from qualibrate.utils.exceptions import StopInspection
from qualibrate.utils.read_files import get_module_name, import_from_path

if TYPE_CHECKING:
    from qualibrate import QualibrationLibrary
    from qualibrate.orchestration.qualibration_orchestrator import (
        QualibrationOrchestrator,
    )

__all__ = ["NodeState", "QGraphBaseType", "QualibrationGraph"]


class NodeState(Enum):
    pending: str = "pending"
    running: str = "running"
    successful: str = "successful"
    failed: str = "failed"


GraphCreateParametersType = GraphParameters
GraphRunParametersType = ExecutionParameters
QGraphBaseType = QRunnable[GraphCreateParametersType, GraphRunParametersType]
_OrchestratorGraphType = Union[
    ReferenceType["QualibrationOrchestrator"], Callable[[], None]
]


class QualibrationGraph(
    QRunnable[GraphCreateParametersType, GraphRunParametersType]
):
    _node_init_args = {"state": NodeState.pending, "retries": 0}
    last_instantiated_graph: Optional["QualibrationGraph"] = None

    def __init__(
        self,
        name: str,
        parameters_class: Type[GraphCreateParametersType],
        nodes: Mapping[str, QualibrationNode],
        connectivity: Sequence[Tuple[str, str]],
        orchestrator: Optional["QualibrationOrchestrator"] = None,
        *,
        description: Optional[str] = None,
    ):
        """
        :param name: graph name
        :param parameters_class: class of parameters
        :param connectivity: Adjacency list.
            Format: `{"name_1": ["name_2", "name_3"], "name_2": ["name_3"]}`
        """
        super().__init__(name, parameters_class, description=description)
        self._nodes = self._validate_nodes_names_mapping(nodes)
        self._connectivity = connectivity
        self._graph = nx.DiGraph()
        self._orchestrator = orchestrator

        for v_name, x_name in connectivity:
            v = self._add_node_by_name(v_name)
            x = self._add_node_by_name(x_name)
            if not self._graph.has_edge(v, x):
                self._graph.add_edge(v, x)
        self.full_parameters_class = self._build_parameters_class()
        self.full_parameters: Optional[GraphRunParametersType] = None

        if self.mode.inspection:
            # ASK: Looks like `last_instantiated_node` and
            #  `_singleton_instance` have same logic -- keep instance of class
            #  in class-level variable. Is it needed to have both?
            self.__class__.last_instantiated_graph = self
            raise StopInspection("Node instantiated in inspection mode")

    @staticmethod
    def _validate_nodes_names_mapping(
        nodes: Mapping[str, QualibrationNode],
    ) -> Mapping[str, QualibrationNode]:
        new_nodes = {}
        for name, node in nodes.items():
            if name != node.name:
                node = node.copy(name)
                warnings.warn(
                    UserWarning(
                        f"{node} has to be copied due to conflicting "
                        f"name ({name})"
                    )
                )
            new_nodes[name] = node
        return new_nodes

    # TODO: logic commonly same with node so need to move to
    @classmethod
    def scan_folder_for_instances(
        cls, path: Path, library: "QualibrationLibrary"
    ) -> Dict[str, QGraphBaseType]:
        graphs: Dict[str, QGraphBaseType] = {}
        inspection = cls.mode.inspection
        try:
            cls.mode.inspection = True

            for file in sorted(path.iterdir()):
                if not file_is_calibration_instance(file, cls.__name__):
                    continue
                try:
                    cls.scan_graph_file(file, graphs)
                except Exception as e:
                    warnings.warn(
                        RuntimeWarning(
                            "An error occurred on scanning graph file "
                            f"{file.name}.\nError message: {e}"
                        )
                    )
        finally:
            cls.mode.inspection = inspection
        return graphs

    @classmethod
    def scan_graph_file(
        cls, file: Path, graphs: Dict[str, QGraphBaseType]
    ) -> None:
        logger.info(f"Scanning graph file {file}")
        try:
            # TODO Think of a safer way to execute the code
            _module = import_from_path(get_module_name(file), file)
        except StopInspection:
            graph = cls.last_instantiated_graph
            cls.last_instantiated_graph = None

            if graph is None:
                logger.warning(f"No graph instantiated in file {file}")
                return

            graph.filepath = file
            graph.mode.inspection = False
            cls.add_graph(graph, graphs)

    @classmethod
    def add_graph(
        cls,
        graph: "QualibrationGraph",
        graphs: Dict[str, QGraphBaseType],
    ) -> None:
        if graph.name in graphs:
            logger.warning(
                f'Graph "{graph.name}" already exists in library, overwriting'
            )

        graphs[graph.name] = graph

    def cleanup(self) -> None:
        nx.set_node_attributes(
            self._graph,
            {node: self._node_init_args.copy() for node in self._graph.nodes},
        )
        if self._orchestrator:
            self._orchestrator.cleanup()

    def completed_count(self) -> int:
        return int(
            sum(
                map(
                    lambda state: state != NodeState.pending,
                    nx.get_node_attributes(self._graph, "state").values(),
                )
            )
        )

    def _get_all_nodes_parameters(
        self, nodes_parameters: Mapping[str, Any]
    ) -> Mapping[str, Any]:
        nodes_class = self.full_parameters_class.model_fields[
            "nodes"
        ].annotation
        return {
            name: nodes_parameters.get(name, {})
            for name in cast(NodesParameters, nodes_class).model_fields.keys()
        }

    def run(self, **passed_parameters: Any) -> BaseRunSummary:
        """
        :param passed_parameters: Graph parameters. Should contain `nodes` key.
        """
        if self._orchestrator is None:
            raise ValueError("Orchestrator not specified")
        self.cleanup()
        nodes = self._get_all_nodes_parameters(
            passed_parameters.get("nodes", {})
        )
        self.parameters = self.parameters_class.model_validate(
            passed_parameters
        )
        self.full_parameters = self.full_parameters_class.model_validate(
            {"parameters": self.parameters, "nodes": nodes}
        )
        targets = self.full_parameters.parameters.targets or []
        nodes_parameters_model = self.full_parameters.nodes
        for node_name in nodes_parameters_model.model_fields_set:
            node_parameters_model = getattr(nodes_parameters_model, node_name)
            if node_parameters_model.targets_name is not None:
                node_parameters_model.targets = targets
        created_at = datetime.now()
        self._orchestrator.traverse_graph(self, targets)
        self.outcomes = self._orchestrator.final_outcomes
        return GraphRunSummary(
            name=self.name,
            description=self.description,
            created_at=created_at,
            completed_at=datetime.now(),
            parameters=self.full_parameters,
            outcomes=self.outcomes,
            initial_targets=targets,
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
        )

    def _get_qnode_or_error(self, node_name: str) -> QualibrationNode:
        node = self._nodes.get(node_name)
        if node is None:
            raise ValueError(f"Unknown node with name {node_name}")
        return node

    def _add_node_by_name(self, node_name: str) -> QualibrationNode:
        node = self._get_qnode_or_error(node_name)
        if node not in self._graph:
            self._graph.add_node(node, **self.__class__._node_init_args)
        return node

    def _build_parameters_class(self) -> Type[GraphRunParametersType]:
        nodes_parameters_class = create_model(
            "GraphNodesParameters",
            __base__=NodesParameters,
            **{  # type: ignore
                node.name: (node.parameters_class, ...)
                for node in self._graph.nodes
            },
        )
        execution_parameters_class = create_model(
            "ExecutionParameters",
            __base__=ExecutionParameters,
            parameters=(self.parameters_class, ...),
            nodes=(nodes_parameters_class, ...),
        )
        return execution_parameters_class

    def serialize(self, **kwargs: Any) -> Mapping[str, Any]:
        data = dict(super().serialize())
        cytoscape = bool(kwargs.get("cytoscape", False))
        parameters = self.full_parameters_class.serialize()
        nx_data: Dict[str, Any] = dict(
            self.nx_graph_export(node_names_only=True)
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
            nx_data.pop("nodes"), nx_data.pop("adjacency")
        ):
            node_id = node["id"]
            nodes[node_id] = node
            node.update(
                {
                    # TODO: simplify node name
                    "name": node_id,
                    "parameters": parameters["nodes"][node["id"]],
                }
            )
            connectivity.extend([(node_id, item["id"]) for item in adjacency])
        data.update({"nodes": nodes, "connectivity": connectivity})
        if cytoscape:
            data["cytoscape"] = self.cytoscape_representation(data)
        return data

    def nx_graph_export(
        self, node_names_only: bool = False
    ) -> Mapping[str, Any]:
        data = dict(nx.readwrite.adjacency_data(self._graph))
        for key in ("multigraph", "directed", "graph"):
            data.pop(key)
        if node_names_only:
            for i, (node, adjacency) in enumerate(
                zip(data["nodes"], data["adjacency"])
            ):
                node["id"] = node["id"].name
                for adj in adjacency:
                    adj["id"] = adj["id"].name
        return data

    def cytoscape_representation(
        self, serialized: Mapping[str, Any]
    ) -> Sequence[Mapping[str, Any]]:
        nodes = [
            {
                "group": "nodes",
                "data": {"id": node},
                "position": {"x": 100, "y": 100},
            }
            for node in serialized["nodes"]
        ]
        edges = [
            {
                "group": "edges",
                "data": {
                    "id": f"{source}_{dest}",
                    "source": source,
                    "target": dest,
                },
            }
            for source, dest in serialized["connectivity"]
        ]
        return [*nodes, *edges]
