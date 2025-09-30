import traceback
from collections.abc import Sequence
from datetime import datetime
from queue import Queue
from typing import Any, Generic

import networkx as nx

from qualibrate import QualibrationGraph
from qualibrate.models.execution_history import (
    ExecutionHistoryItem,
    ItemData,
    ItemMetadata,
)
from qualibrate.models.node_status import NodeStatus
from qualibrate.models.outcome import Outcome
from qualibrate.models.run_summary.run_error import RunError
from qualibrate.orchestration.qualibration_orchestrator import (
    QualibrationOrchestrator,
)
from qualibrate.qualibration_graph import NodeTypeVar
from qualibrate.utils.logger_m import logger

__all__ = ["BasicOrchestrator"]


class BasicOrchestrator(
    QualibrationOrchestrator[NodeTypeVar], Generic[NodeTypeVar]
):
    """
    A basic orchestrator that manages the execution of nodes in a graph.
    This orchestrator firstly run nodes without predecessors. And then just
    walk through directed graph for resolving nodes that can be executed
    (all predecessors are completed).

    Args:
        skip_failed (bool): If True, when a target (qubit) fails in a node,
            it is excluded from being a target for any future nodes.

    """

    def __init__(self, skip_failed: bool = False):
        """
        Initializes a new instance of the BasicOrchestrator.

        """
        super().__init__(skip_failed=skip_failed)
        self._execution_queue: Queue[NodeTypeVar] = Queue()

    def _is_execution_finished(self) -> bool:
        """
        Checks whether the execution is finished.

        Returns:
            bool: True if the execution is finished, False otherwise.
        """
        if self._graph is None:
            return True
        if self._execution_queue.qsize() == 0:
            return True
        if self.targets is None or len(self.targets) == 0:
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
        """
        Cleans up the orchestrator state.

        Clears the execution queue and calls the parent cleanup method.
        """
        super().cleanup()
        with self._execution_queue.mutex:
            self._execution_queue.queue.clear()

    @property
    def nx_graph(self) -> "nx.DiGraph[NodeTypeVar]":
        """
        Gets the networkx representation of the graph.

        Returns:
            nx.DiGraph[QualibrationNode]: The directed graph.

        Raises:
            ValueError: If the graph is not specified.
        """
        if self._graph is None:
            raise ValueError("Graph is not specified")
        return self._graph._graph

    def check_node_finished(self, node: NodeTypeVar) -> bool:
        """
        Checks if a node was successfully executed.

        Args:
            node (QualibrationNode): The node to check.

        Returns:
            bool: True if the node is successful, False otherwise.
        """
        if self._graph is None:
            return False
        return bool(
            self.nx_graph.nodes[node][QualibrationGraph.STATUS_FIELD]
            == NodeStatus.finished
        )

    def get_next_node(self) -> NodeTypeVar | None:
        """
        Gets the next node to execute.

        Returns:
            Optional[QualibrationNode]: The next node to execute, or None
                if there are no more nodes to be executed
        """
        while not self._execution_queue.empty():
            node_to_run = self._execution_queue.get()
            if all(
                map(self.check_node_finished, self.nx_graph.pred[node_to_run])
            ):
                return node_to_run
        return None

    def traverse_graph(
        self, graph: QualibrationGraph[NodeTypeVar], targets: Sequence[Any]
    ) -> None:
        """
        Traverses the graph and orchestrates node execution.

        Args:
            graph (QualibrationGraph): The graph to traverse.
            targets (Sequence[Any]): The target nodes to execute.

        Raises:
            RuntimeError:
                If graph parameters are not specified or no next node is found.
        """
        logger.info(f"Traverse graph {graph.name} with targets {targets}")
        if self._is_stopped:
            return
        self._graph = graph
        if graph.full_parameters is None:
            ex = RuntimeError("Execution graph parameters not specified")
            logger.exception("", exc_info=ex)
            raise ex
        self.initial_targets = list(targets[:]) if targets else []
        self.targets = self.initial_targets.copy()
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
            if node_to_run is None:
                exc = RuntimeError("No next node. Execution not finished")
                logger.exception("", exc_info=exc)
                raise exc
            logger.info(f"Graph. Node to run. {node_to_run}")
            node_to_run_parameters = getattr(nodes_parameters, node_to_run.name)
            run_start = datetime.now().astimezone()
            run_error: RunError | None = None
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
                if self._parameters.skip_failed:
                    self.targets = node_result.successful_targets
                logger.debug(f"Node completed. Result: {node_result}")
            except Exception as ex:
                new_status = NodeStatus.error
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
                new_status = NodeStatus.finished
            finally:
                self._execution_history.append(
                    ExecutionHistoryItem(
                        id=node_to_run.snapshot_idx,
                        created_at=run_start,
                        metadata=ItemMetadata(
                            name=node_to_run.name,
                            description=node_to_run.description,
                            status=new_status,
                            run_start=run_start,
                            run_end=datetime.now().astimezone(),
                        ),
                        data=ItemData(
                            parameters=node_to_run.parameters,
                            outcomes=node_to_run.outcomes,
                            error=run_error,
                        ),
                    )
                )
            # Suppose that all nodes are successfully finish
            nx_graph.nodes[node_to_run][QualibrationGraph.STATUS_FIELD] = (
                new_status
            )
            if new_status == NodeStatus.finished:
                for successor in successors[node_to_run]:
                    self._execution_queue.put(successor)
        self._active_node = None
        # TODO: correct resolving of outcomes
        for target in targets:
            self.final_outcomes[target] = Outcome.SUCCESSFUL
