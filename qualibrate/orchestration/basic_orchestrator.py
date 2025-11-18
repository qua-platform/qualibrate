import traceback
import weakref
from collections.abc import Sequence
from datetime import datetime
from queue import Queue
from typing import Generic, cast

import networkx as nx

from qualibrate.models.execution_history import (
    ExecutionHistoryItem,
    ItemData,
    ItemMetadata,
)
from qualibrate.models.node_status import ElementRunStatus
from qualibrate.models.outcome import Outcome
from qualibrate.models.run_summary.run_error import RunError
from qualibrate.orchestration.qualibration_orchestrator import (
    QualibrationOrchestrator,
)
from qualibrate.qualibration_graph import GraphElementTypeVar, QualibrationGraph
from qualibrate.qualibration_node import QualibrationNode
from qualibrate.utils.logger_m import logger
from qualibrate.utils.type_protocols import TargetType

__all__ = ["BasicOrchestrator"]


class BasicOrchestrator(
    QualibrationOrchestrator[GraphElementTypeVar], Generic[GraphElementTypeVar]
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
        self._execution_queue: Queue[GraphElementTypeVar] = Queue()

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
        return all(
            map(
                lambda status: status != ElementRunStatus.pending,
                nx.get_node_attributes(
                    self.nx_graph, QualibrationGraph.ELEMENT_STATUS_FIELD
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
    def nx_graph(self) -> "nx.DiGraph[GraphElementTypeVar]":
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

    def check_node_finished(self, node: GraphElementTypeVar) -> bool:
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
            self.nx_graph.nodes[node][QualibrationGraph.ELEMENT_STATUS_FIELD]
            == ElementRunStatus.finished
        )

    def get_next_element(self) -> GraphElementTypeVar | None:
        """
        Gets the next node to execute.

        Returns:
            Optional[QualibrationNode]: The next node to execute, or None
                if there are no more nodes to be executed
        """
        while not self._execution_queue.empty():
            element_to_run = self._execution_queue.get()
            if all(
                map(
                    self.check_node_finished, self.nx_graph.pred[element_to_run]
                )
            ):
                return element_to_run
        return None

    def _get_in_targets_for_element(
        self, element: GraphElementTypeVar
    ) -> Sequence[TargetType]:
        """
        Retrieves the list of input targets for a given graph element.

        This method determines which targets should be passed to an element
        based on its predecessors. If the element has no predecessors,
        the orchestrator's initial targets are used. Otherwise, it computes
        the intersection of targets shared across all incoming edges.

        Args:
            element (GraphElementTypeVar): The graph element whose input targets
                are being determined.

        Returns:
            Sequence[TargetType]: The list of targets that should be used
            as inputs for the specified element.
        """
        predecessors = list(self.nx_graph.predecessors(element))
        if len(predecessors) == 0:
            return self.initial_targets or []

        targets_lst = [
            set(
                self.nx_graph.edges[pred, element].get(
                    QualibrationGraph.EDGE_TARGETS_FIELD, []
                )
            )
            for pred in predecessors
        ]
        targets = set.intersection(*targets_lst)
        return list(targets)

    def _set_out_targets_for_element(
        self,
        element: GraphElementTypeVar,
    ) -> None:
        """
        Sets the output targets for the given graph element.

        After an element finishes running, this method updates the outgoing
        edges with the appropriate set of targets. If `skip_failed` is enabled,
        only the successful targets from the element's run summary are
        propagated; otherwise, all initial targets are used.

        Args:
            element (GraphElementTypeVar): The graph element whose output
                targets are being set.

        Raises:
            RuntimeError: If the element does not have a run summary.
        """
        summary = element.run_summary
        if summary is None:
            raise RuntimeError(
                f"Can't set out targets of {element} without run summary"
            )

        has_failed_successor = any(
            self.nx_graph[element][successor]["scenario"] == Outcome.FAILED
            for successor in self.nx_graph.successors(element)
        )
        successful_out_targets: Sequence[TargetType]
        if has_failed_successor:
            successful_out_targets = summary.successful_targets
            failed_out_targets = summary.failed_targets
            for successor in self.nx_graph.successors(element):
                self.nx_graph.edges[element, successor][
                    QualibrationGraph.EDGE_TARGETS_FIELD
                ] = (
                    successful_out_targets
                    if self.nx_graph[element][successor]["scenario"]
                    == Outcome.SUCCESSFUL
                    else failed_out_targets
                )
        else:
            successful_out_targets = (
                summary.successful_targets
                if self._parameters.skip_failed
                else summary.initial_targets
            )

            for successor in self.nx_graph.successors(element):
                self.nx_graph.edges[element, successor][
                    QualibrationGraph.EDGE_TARGETS_FIELD
                ] = successful_out_targets

    def traverse_graph(
        self,
        graph: QualibrationGraph[GraphElementTypeVar],
        targets: Sequence[TargetType],
    ) -> None:
        """
        Traverses the graph and orchestrates node execution.

        Args:
            graph (QualibrationGraph): The graph to traverse.
            targets (Sequence[TargetType]): The target nodes to execute.

        Raises:
            RuntimeError:
                If graph parameters are not specified or no next node is found.
        """
        logger.info(f"Traverse graph {graph.name} with targets {targets}")
        if self._is_stopped:
            return
        self._graph = weakref.proxy(graph)
        if graph.full_parameters is None:
            ex = RuntimeError("Execution graph parameters not specified")
            logger.exception("", exc_info=ex)
            raise ex
        self.initial_targets = list(targets[:]) if targets else []
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
            element_to_run = self.get_next_element()
            if element_to_run is None:
                exc = RuntimeError("No next node. Execution not finished")
                logger.exception("", exc_info=exc)
                raise exc
            logger.info(f"Graph. Element to run. {element_to_run}")
            element_to_run_parameters = getattr(
                nodes_parameters, element_to_run.name
            )
            run_start = datetime.now().astimezone()
            run_error: RunError | None = None
            try:
                self._active_element = element_to_run
                element_to_run_parameters.targets = (
                    self._get_in_targets_for_element(element_to_run)
                )
                if isinstance(element_to_run, QualibrationNode):
                    element_parameters = element_to_run_parameters.model_dump()
                else:
                    element_parameters = (
                        element_to_run_parameters.parameters.model_dump()
                    )
                    element_parameters["nodes"] = (
                        element_to_run_parameters.nodes.model_dump()
                    )

                logger.debug(
                    f"Graph. Start running element {element_to_run} "
                    f"with parameters {element_parameters}"
                )
                element_results = element_to_run.run(
                    interactive=False, **element_parameters
                )
                self._set_out_targets_for_element(element_to_run)
                logger.debug(f"Element completed. Result: {element_results}")
            except Exception as ex:
                new_status = ElementRunStatus.error
                nx_graph.nodes[element_to_run]["error"] = str(ex)
                logger.exception(
                    (
                        f"Failed to run element {element_to_run.name} "
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
                new_status = ElementRunStatus.finished
            finally:
                idx = (
                    element_to_run.snapshot_idx
                    if isinstance(element_to_run, QualibrationNode)
                    else None
                )
                data = ItemData(
                    parameters=element_to_run.parameters,
                    outcomes=element_to_run.outcomes,
                    error=run_error,
                )
                subitem_history = None
                if isinstance(element_to_run, QualibrationGraph) and (
                    orch := element_to_run._orchestrator
                ):
                    subitem_history = orch.get_execution_history()
                item_history = ExecutionHistoryItem(
                    id=idx,
                    created_at=run_start,
                    metadata=ItemMetadata(
                        name=element_to_run.name,
                        description=element_to_run.description,
                        status=new_status,
                        run_start=run_start,
                        run_end=datetime.now().astimezone(),
                    ),
                    data=data,
                    elements_history=subitem_history,
                )
                self._execution_history.append(item_history)
            # mypy can't correctly parse after isinstance(...,QualibrationGraph)
            element_to_run = cast(GraphElementTypeVar, element_to_run)
            nx_graph.nodes[element_to_run][
                QualibrationGraph.ELEMENT_STATUS_FIELD
            ] = new_status
            if new_status == ElementRunStatus.finished:
                for successor in successors[element_to_run]:
                    """
                     checks if we have a scenario failed node defined with
                     no failed targets,
                     in this case we dont want to get this node into the queue
                    """
                    if (
                        nx_graph.edges[element_to_run, successor]["scenario"]
                        == Outcome.FAILED
                        and not nx_graph.edges[element_to_run, successor][
                            QualibrationGraph.EDGE_TARGETS_FIELD
                        ]
                    ):
                        continue
                    self._execution_queue.put(successor)
        self._active_element = None
        self._fill_final_outcomes()

    def _fill_final_outcomes(self) -> None:
        """Compute and fill final orchestration outcomes from nodes without
        successors. Logic and operator is used. Orchestrator target is marked
        as successful only if the target is successful for all related nodes.

        | target | node_1 | node_2 | graph |
        | ------ | ------ | ------ | ----- |
        | q1 | successful | successful | successful|
        | q2 | successful | failed | failed |
        | q3 | failed | failed | failed |

        """
        successors = self.nx_graph.succ
        elements_without_successors = list(
            filter(lambda n: len(successors[n]) == 0, successors.keys())
        )
        for target in self.initial_targets or []:
            successful = all(
                map(
                    lambda outcome: outcome == Outcome.SUCCESSFUL,
                    [
                        node.outcomes.get(target, Outcome.FAILED)
                        for node in elements_without_successors
                    ],
                )
            )
            self.final_outcomes[target] = (
                Outcome.SUCCESSFUL if successful else Outcome.FAILED
            )
