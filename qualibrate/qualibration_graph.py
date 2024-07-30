import importlib
import sys
from enum import Enum
from pathlib import Path
from queue import Queue
from typing import TYPE_CHECKING, Any, Dict, Mapping, Optional, Sequence, Type

import networkx as nx

from qualibrate.parameters import GraphParameters
from qualibrate.q_runnnable import QRunnable, file_is_calibration_instance
from qualibrate.qualibration_node import QualibrationNode
from qualibrate.storage.local_storage_manager import logger
from qualibrate.utils.exceptions import StopInspection

if TYPE_CHECKING:
    from qualibrate import QualibrationLibrary


__all__ = ["NodeState", "QGraphBaseType", "QualibrationGraph"]


class NodeState(Enum):
    pending: str = "pending"
    running: str = "running"
    successful: str = "successful"
    failed: str = "failed"


QGraphBaseType = QRunnable[GraphParameters]


class QualibrationGraph(QGraphBaseType):
    _node_init_args = {"state": NodeState.pending, "retries": 0}
    last_instantiated_graph: Optional["QualibrationGraph"] = None

    def __init__(
        self,
        name: str,
        parameters_class: Type[GraphParameters],
        adjacency: Mapping[str, Sequence[str]],
    ):
        """
        :param name: graph name
        :param parameters_class: class of parameters
        :param adjacency: Adjacency list.
            Format: `{"name_1": ["name_2", "name_3"], "name_2": ["name_3"]}`
        """
        super().__init__(name, parameters_class)
        self._adjacency = adjacency

        self._graph = nx.DiGraph()

        lib_module = importlib.import_module("qualibrate.qualibration_library")
        qlib_class = lib_module.QualibrationLibrary

        for v_name, xs_names in adjacency.items():
            v = self._add_graph_by_name(v_name, qlib_class)
            for x_name in xs_names:
                x = self._add_graph_by_name(x_name, qlib_class)
                self._graph.add_edge(v, x)

        if self.mode.inspection:
            # ASK: Looks like `last_instantiated_node` and
            #  `_singleton_instance` have same logic -- keep instance of class
            #  in class-level variable. Is it needed to have both?
            self.__class__.last_instantiated_graph = self
            raise StopInspection("Node instantiated in inspection mode")

    # TODO: logic commonly same with node so need to move to
    @classmethod
    def scan_folder_for_instances(
        cls, path: Path, library: "QualibrationLibrary"
    ) -> Dict[str, QGraphBaseType]:
        graphs: Dict[str, QGraphBaseType] = {}
        inspection = cls.mode.inspection
        str_path = str(path)
        lib_path_exists = str_path in sys.path
        if not lib_path_exists:
            sys.path.append(str_path)
        try:
            cls.mode.inspection = True

            for file in sorted(path.iterdir()):
                if not file_is_calibration_instance(file, cls.__name__):
                    continue
                cls.scan_graph_file(file, graphs)
        finally:
            if not lib_path_exists:
                sys.path.remove(str_path)
            cls.mode.inspection = inspection
        return graphs

    @classmethod
    def scan_graph_file(
        cls, file: Path, graphs: Dict[str, QGraphBaseType]
    ) -> None:
        logger.info(f"Scanning graph file {file}")
        try:
            # TODO Think of a safer way to execute the code
            importlib.import_module(file.name)
        except StopInspection:
            graph = cls.last_instantiated_graph
            cls.last_instantiated_graph = None

            if graph is None:
                logger.warning(f"No node instantiated in file {file}")
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

    def _is_execution_finished(self) -> bool:
        return all(
            map(
                lambda state: state == NodeState.successful,
                nx.get_node_attributes(self._graph, "state").values(),
            )
        )

    def run(
        self,
        parameters: GraphParameters,
    ) -> None:
        # TODO: ask how graph params should be used?
        nodes_parameters = parameters.nodes_parameters
        predecessors = self._graph.pred
        successors = self._graph.succ
        nodes_without_predecessors = filter(
            lambda n: len(predecessors[n]) == 0, predecessors.keys()
        )
        execution_queue: Queue[QualibrationNode] = Queue()
        for node in nodes_without_predecessors:
            execution_queue.put(node)
        while not self._is_execution_finished():
            node_to_run = execution_queue.get()
            if any(
                map(
                    lambda n: self._graph.nodes[n]["state"]
                    != NodeState.successful,
                    predecessors[node_to_run],
                )
            ):
                continue
            node_parameters = node_to_run.parameters_class(
                **nodes_parameters[node_to_run.name].model_dump()
            )
            # TODO: wrap status of execution
            node_to_run.run(node_parameters)
            new_state = NodeState.successful
            self._graph.nodes[node_to_run]["state"] = new_state
            if new_state == NodeState.successful:
                for successor in successors[node_to_run]:
                    execution_queue.put(successor)
            else:
                execution_queue.put(node_to_run)

    def _add_graph_by_name(
        self, node_name: str, lib: Type["QualibrationLibrary"]
    ) -> QualibrationNode:
        library = lib.active_library
        if library is None:
            raise ValueError("QualibrationLibrary not specified")
        node = library.nodes.get(node_name)
        if node is None:
            raise ValueError(f"Unknown node with name {node_name}")
        if node not in self._graph:
            self._graph.add_node(node, **self.__class__._node_init_args)
        return node

    def export(self, node_names_only: bool = False) -> Mapping[str, Any]:
        data = dict(nx.readwrite.adjacency_data(self._graph))
        if node_names_only:
            for i, (node, adjacency) in enumerate(
                zip(data["nodes"], data["adjacency"])
            ):
                node["id"] = node["id"].name
                for adj in adjacency:
                    adj["id"] = adj["id"].name
        return data
