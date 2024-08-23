from queue import Queue
from typing import Any, Optional, Sequence

import networkx as nx

from qualibrate import QualibrationGraph, QualibrationNode
from qualibrate.orchestration.qualibration_orchestrator import (
    QualibrationOrchestrator,
)
from qualibrate.outcome import Outcome
from qualibrate.qualibration_graph import NodeState


class BasicOrchestrator(QualibrationOrchestrator):
    def __init__(self, skip_failed: bool = False):
        super().__init__(skip_failed=skip_failed)
        self._execution_queue: Queue[QualibrationNode] = Queue()

    def _is_execution_finished(self) -> bool:
        if self._graph is None:
            return True
        return all(
            map(
                lambda state: state == NodeState.successful,
                nx.get_node_attributes(self.nx_graph, "state").values(),
            )
        )

    @property
    def nx_graph(self) -> nx.DiGraph:
        if self._graph is None:
            raise ValueError("Graph is not specified")
        return self._graph._graph

    def check_node_successful(self, node: QualibrationNode) -> bool:
        if self._graph is None:
            return False
        return bool(self.nx_graph.nodes[node]["state"] == NodeState.successful)

    def get_next_node(self) -> Optional[QualibrationNode]:
        while not self._execution_queue.empty():
            node_to_run = self._execution_queue.get()
            if all(
                map(self.check_node_successful, self.nx_graph.pred[node_to_run])
            ):
                return node_to_run
        return None

    def traverse_graph(
        self, graph: QualibrationGraph, targets: Sequence[Any]
    ) -> None:
        self._graph = graph
        if graph.full_parameters is None:
            raise RuntimeError("Execution graph parameters not specified")
        nodes_parameters = graph.full_parameters.nodes
        nx_graph = self.nx_graph
        predecessors = nx_graph.pred
        successors = nx_graph.succ
        nodes_without_predecessors = filter(
            lambda n: len(predecessors[n]) == 0, predecessors.keys()
        )
        for node in nodes_without_predecessors:
            self._execution_queue.put(node)

        while not self._is_execution_finished():
            node_to_run = self.get_next_node()
            if node_to_run is None:
                raise RuntimeError("No next node. Execution not finished")
            # TODO: wrap status of execution
            node_to_run.run(
                **getattr(nodes_parameters, node_to_run.name).model_dump()
            )
            # Suppose that all nodes are successfully finish
            new_state = NodeState.successful
            nx_graph.nodes[node_to_run]["state"] = new_state
            if new_state == NodeState.successful:
                for successor in successors[node_to_run]:
                    self._execution_queue.put(successor)

        for target in targets:
            self.final_outcomes[target] = Outcome.SUCCESSFUL
