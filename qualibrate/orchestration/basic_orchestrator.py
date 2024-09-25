import traceback
from datetime import datetime
from queue import Queue
from typing import Any, Optional, Sequence

import networkx as nx

from qualibrate import QualibrationGraph, QualibrationNode
from qualibrate.models.execution_history import ExecutionHistoryItem
from qualibrate.models.node_status import NodeStatus
from qualibrate.models.outcome import Outcome
from qualibrate.models.run_summary.run_error import RunError
from qualibrate.orchestration.qualibration_orchestrator import (
    QualibrationOrchestrator,
)
from qualibrate.utils.logger_m import logger

__all__ = ["BasicOrchestrator"]


class BasicOrchestrator(QualibrationOrchestrator):
    def __init__(self, skip_failed: bool = False):
        super().__init__(skip_failed=skip_failed)
        self._execution_queue: Queue[QualibrationNode] = Queue()

    def _is_execution_finished(self) -> bool:
        if self._graph is None:
            return True
        if self._execution_queue.qsize() == 0:  # finished if queue is empty
            return True
        return all(
            map(
                lambda status: status != NodeStatus.pending,
                nx.get_node_attributes(
                    self.nx_graph, QualibrationGraph.STATUS_FIELD
                ).values(),
            )
        )

    def cleanup(self) -> None:
        super().cleanup()
        with self._execution_queue.mutex:
            self._execution_queue.queue.clear()

    @property
    def nx_graph(self) -> nx.DiGraph:
        if self._graph is None:
            raise ValueError("Graph is not specified")
        return self._graph._graph

    def check_node_successful(self, node: QualibrationNode) -> bool:
        if self._graph is None:
            return False
        return bool(
            self.nx_graph.nodes[node][QualibrationGraph.STATUS_FIELD]
            == NodeStatus.successful
        )

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
        logger.info(f"Traverse graph {graph.name} with targets {targets}")
        if self._is_stopped:
            return
        self._graph = graph
        if graph.full_parameters is None:
            ex = RuntimeError("Execution graph parameters not specified")
            logger.exception("", exc_info=ex)
            raise ex
        self.initial_targets = (
            graph.full_parameters.parameters.targets or []
        ).copy()
        self.targets = (
            self.initial_targets.copy() if self.initial_targets else None
        )
        nodes_parameters = graph.full_parameters.nodes
        nx_graph = self.nx_graph
        predecessors = nx_graph.pred
        successors = nx_graph.succ
        nodes_without_predecessors = filter(
            lambda n: len(predecessors[n]) == 0, predecessors.keys()
        )
        for node in nodes_without_predecessors:
            self._execution_queue.put(node)

        while not self._is_execution_finished() and not self._is_stopped:
            node_to_run = self.get_next_node()
            logger.info(f"Graph. Node to run. {node_to_run}")
            if node_to_run is None:
                exc = RuntimeError("No next node. Execution not finished")
                logger.exception("", exc_info=exc)
                raise exc
            node_to_run_parameters = getattr(nodes_parameters, node_to_run.name)
            run_start = datetime.now()
            run_error: Optional[RunError] = None
            try:
                self._active_node = node_to_run
                node_to_run_parameters.targets = self.targets
                node_parameters = node_to_run_parameters.model_dump()
                logger.debug(
                    f"Graph. Start running node {node_to_run} "
                    f"with parameters {node_parameters}"
                )
                node_result = node_to_run.run(
                    interactive=False, **node_parameters
                )
                last_executed_node = node_to_run.__class__.last_executed_node
                if last_executed_node is None:
                    last_executed_node = node_to_run
                    logger.warning(
                        "Last executed node not set after running {node_to_run}"
                    )
                if self._parameters.skip_failed:
                    self.targets = node_result.successful_targets
                logger.debug(f"Node completed. Result: {node_result}")
            except Exception as ex:
                new_status = NodeStatus.failed
                nx_graph.nodes[node_to_run]["error"] = str(ex)
                logger.exception(
                    (
                        f"Failed to run node {node_to_run.name} "
                        f"in graph {self._graph.name}"
                    ),
                    exc_info=ex,
                )
                run_error = RunError(
                    error_class=ex.__class__.__name__,
                    message=str(ex),
                    traceback=traceback.format_tb(ex.__traceback__),
                )
                raise
            else:
                new_status = NodeStatus.successful
            finally:
                self._execution_history.append(
                    ExecutionHistoryItem(
                        name=last_executed_node.name,
                        description=last_executed_node.description,
                        snapshot_idx=last_executed_node.snapshot_idx,
                        outcomes=last_executed_node.outcomes,
                        status=new_status,
                        error=run_error,
                        run_start=run_start,
                        run_end=datetime.now(),
                        parameters=last_executed_node._parameters,
                    )
                )
            # Suppose that all nodes are successfully finish
            nx_graph.nodes[node_to_run][
                QualibrationGraph.STATUS_FIELD
            ] = new_status
            if new_status == NodeStatus.successful:
                for successor in successors[node_to_run]:
                    self._execution_queue.put(successor)
        self._active_node = None
        # TODO: correct resolving of outcomes
        for target in targets:
            self.final_outcomes[target] = Outcome.SUCCESSFUL
