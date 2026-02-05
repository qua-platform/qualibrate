import traceback
import weakref
from collections.abc import Generator, Iterable, Sequence
from datetime import datetime
from queue import Queue
from typing import TYPE_CHECKING, Any, Generic, cast

import networkx as nx

from qualibrate.core.models.execution_history import (
    ExecutionHistoryItem,
    ItemData,
    ItemMetadata,
)
from qualibrate.core.models.node_status import ElementRunStatus
from qualibrate.core.models.operational_condition import OperationalCondition
from qualibrate.core.models.outcome import Outcome
from qualibrate.core.models.run_summary.base import BaseRunSummary
from qualibrate.core.models.run_summary.run_error import RunError
from qualibrate.core.orchestration.qualibration_orchestrator import (
    QualibrationOrchestrator,
)
from qualibrate.core.parameters import ExecutionParameters, NodeParameters
from qualibrate.core.qualibration_graph import GraphElementTypeVar, QualibrationGraph
from qualibrate.core.qualibration_node import QualibrationNode
from qualibrate.core.storage.local_storage_manager import LocalStorageManager
from qualibrate.core.utils.logger_m import logger
from qualibrate.core.utils.type_protocols import TargetType

if TYPE_CHECKING:
    from qualibrate.core.storage.storage_manager import StorageManager

__all__ = ["BasicOrchestrator"]


class BasicOrchestrator(QualibrationOrchestrator[GraphElementTypeVar], Generic[GraphElementTypeVar]):
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
        self._workflow_storage_manager: "StorageManager[Any] | None" = None
        self._workflow_snapshot_idx: int | None = None
        self._workflow_parent_id: int | None = None
        self._children_ids: list[int] = []

    def _get_workflow_storage_manager(
        self,
    ) -> LocalStorageManager[Any]:
        """Get or create a storage manager for workflow snapshots."""
        if self._workflow_storage_manager is not None:
            return cast(LocalStorageManager[Any], self._workflow_storage_manager)

        # Import here to avoid circular imports
        from qualibrate_config.resolvers import (
            get_qualibrate_config,
            get_qualibrate_config_path,
        )

        from qualibrate.core.config.resolvers import get_quam_state_path

        q_config_path = get_qualibrate_config_path()
        qs = get_qualibrate_config(q_config_path)
        state_path = get_quam_state_path(qs)
        self._workflow_storage_manager = LocalStorageManager(
            root_data_folder=qs.storage.location,
            active_machine_path=state_path,
        )
        return self._workflow_storage_manager

    def set_workflow_parent_id(self, parent_id: int | None) -> None:
        """Set the parent workflow ID for nested workflows."""
        self._workflow_parent_id = parent_id

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
                nx.get_node_attributes(self.nx_graph, QualibrationGraph.ELEMENT_STATUS_FIELD).values(),
            )
        )

    def cleanup(self) -> None:
        """
        Cleans up the orchestrator state.

        Clears the execution queue and calls the parent cleanup method.

        Note: _workflow_parent_id is NOT reset here because it's set externally
        by the parent orchestrator before this graph runs. Resetting it would
        cause nested graphs/nodes to appear at the top level of history during
        execution because their snapshots would be created without parent ID.
        """
        super().cleanup()
        with self._execution_queue.mutex:
            self._execution_queue.queue.clear()
        # Reset workflow snapshot state (but preserve _workflow_parent_id)
        self._workflow_snapshot_idx = None
        self._children_ids = []

    @property
    def q_graph(self) -> QualibrationGraph[GraphElementTypeVar]:
        if graph := self._graph:
            return graph
        raise ValueError("Graph is not specified")

    @property
    def nx_graph(self) -> "nx.DiGraph[GraphElementTypeVar]":
        """
        Gets the networkx representation of the graph.

        Returns:
            nx.DiGraph[QualibrationNode]: The directed graph.

        Raises:
            ValueError: If the graph is not specified.
        """
        return self.q_graph._graph

    def check_node_finished(self, node: GraphElementTypeVar) -> bool:
        """
        Checks if a node was successfully executed.

        Args:
            node (QualibrationNode): The node to check.

        Returns:
            bool: True if the node is successful, False otherwise.
        """
        return bool(
            self.nx_graph.nodes[node][QualibrationGraph.ELEMENT_STATUS_FIELD]
            in (ElementRunStatus.skipped, ElementRunStatus.finished)
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
            # Skip if already finished (handles duplicate queue entries)
            # for cases like diamond cases where a-> b,c b,c->d
            # d will be twice in queue and we dont want to execute it twice
            if self.check_node_finished(element_to_run):
                continue

            if all(map(self.check_node_finished, self.nx_graph.pred[element_to_run])):
                return element_to_run
        return None

    def _get_in_targets_for_element(self, element: GraphElementTypeVar) -> Sequence[TargetType]:
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
        nx_graph = self.nx_graph

        loop_targets = set(nx_graph.nodes[element].get(QualibrationGraph.LOOP_TARGETS_FIELD, []))

        predecessors = nx_graph.predecessors(element)
        if all(
            (nx_graph.nodes[predecessor][QualibrationGraph.ELEMENT_STATUS_FIELD] == ElementRunStatus.skipped)
            for predecessor in predecessors
        ):
            initial = set(self.initial_targets or [])
            return list(initial.union(loop_targets))

        targets_lst = [
            set(nx_graph.edges[pred, element].get(QualibrationGraph.EDGE_TARGETS_FIELD, []))
            for pred in list(nx_graph.predecessors(element))
            if nx_graph.nodes[pred][QualibrationGraph.ELEMENT_STATUS_FIELD] != ElementRunStatus.skipped
        ]
        targets = set.intersection(*targets_lst).union(loop_targets)
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
            raise RuntimeError(f"Can't set out targets of {element} without run summary")

        # self.nx_graph.edges[element, successor]["operational_condition"]
        # is of type OperationalCondition
        has_on_failed_successors = any(
            self.nx_graph.edges[element, successor][QualibrationGraph.RUN_SCENARIO_FIELD] == Outcome.FAILED
            for successor in self.nx_graph.successors(element)
        )
        successful_out_targets: Sequence[TargetType]
        if has_on_failed_successors:
            successful_out_targets = summary.successful_targets
            failed_out_targets = summary.failed_targets
            for successor in self.nx_graph.successors(element):
                self.nx_graph.edges[element, successor][QualibrationGraph.EDGE_TARGETS_FIELD] = (
                    successful_out_targets
                    if self.nx_graph.edges[element, successor][QualibrationGraph.RUN_SCENARIO_FIELD]
                    == Outcome.SUCCESSFUL
                    else self._execute_condition(
                        self.nx_graph.edges[element, successor][QualibrationGraph.OPERATIONAL_CONDITION_FIELD],
                        element,
                        failed_out_targets,
                    )
                )
        else:
            successful_out_targets = (
                summary.successful_targets if self._parameters.skip_failed else summary.initial_targets
            )

            for successor in self.nx_graph.successors(element):
                self.nx_graph.edges[element, successor][QualibrationGraph.EDGE_TARGETS_FIELD] = successful_out_targets

    def _execute_condition(
        self,
        operational_condition: OperationalCondition[GraphElementTypeVar],
        element: GraphElementTypeVar,
        targets: list[TargetType],
    ) -> list[TargetType]:
        if operational_condition.on_generator is not None:
            executed_condition = operational_condition.on_generator()
            # priming the generator, we need to get to the point
            # where the generator expects out two variables
            executed_condition.send(None)
            return [target for target in targets if executed_condition.send((element, target))]
        elif operational_condition.on_function is not None:
            return [target for target in targets if operational_condition.on_function(element, target)]
        # No condition specified, return all targets
        return targets

    def _execute_loop_iteration(
        self,
        element_to_run: GraphElementTypeVar,
        parameters: NodeParameters | ExecutionParameters,
    ) -> BaseRunSummary:
        parameters.targets = self._get_in_targets_for_element(element_to_run)

        if isinstance(element_to_run, QualibrationNode):
            parameters = cast(NodeParameters, parameters)
            element_parameters = parameters.model_dump()
        else:
            parameters = cast(ExecutionParameters, parameters)
            element_parameters = parameters.parameters.model_dump()
            element_parameters["nodes"] = parameters.nodes.model_dump()
        element_to_run.cleanup()

        # Set workflow_parent_id on the element BEFORE running it.
        # This ensures the snapshot is created with the parent ID from the start,
        # preventing nested items from appearing at the top level of history.
        if self._workflow_snapshot_idx is not None:
            if isinstance(element_to_run, QualibrationNode):
                # For nodes, set the parent ID on the storage manager
                element_to_run.set_workflow_parent_id(self._workflow_snapshot_idx)
            elif (
                isinstance(element_to_run, QualibrationGraph)
                and element_to_run._orchestrator is not None
            ):
                # For nested graphs, set on the orchestrator
                nested_orch = cast(
                    BasicOrchestrator[Any], element_to_run._orchestrator
                )
                nested_orch.set_workflow_parent_id(self._workflow_snapshot_idx)

        logger.debug(
            f"Graph. Start running element {element_to_run} "
            f"with parameters {element_parameters}"
        )

        return element_to_run.run(interactive=False, **element_parameters)

    def _is_loop_iteration_needed(self, element_to_run: GraphElementTypeVar) -> Generator[bool]:
        yield True
        graph = self.q_graph
        nx_graph = self.nx_graph
        conditions = graph._loop_conditions.get(element_to_run.name)
        if conditions is None:
            yield False
            return
        i = 1
        g_condition = conditions.on_generator() if conditions.on_generator else None
        if g_condition is not None:
            g_condition.send(None)
        max_iterations = conditions.max_iterations
        while True:
            if max_iterations is not None and i >= max_iterations:
                yield False
                return
            if (
                conditions.on_failure
                and nx_graph.nodes[element_to_run][QualibrationGraph.ELEMENT_STATUS_FIELD] == ElementRunStatus.error
            ):
                i += 1
                yield True
            elif filter_f := conditions.on_function:
                initial_t = element_to_run.run_summary.initial_targets if element_to_run.run_summary else []
                reuse_t = [target for target in initial_t if filter_f(element_to_run, target)]
                if len(reuse_t) > 0:
                    i += 1
                    nx_graph.nodes[element_to_run][QualibrationGraph.LOOP_TARGETS_FIELD] = reuse_t
                    yield True
                else:
                    yield False
                    return
            elif g_condition is not None:
                initial_t = element_to_run.run_summary.initial_targets if element_to_run.run_summary else []
                try:
                    reuse_t = [target for target in initial_t if g_condition.send((element_to_run, target))]
                    if len(reuse_t) > 0:
                        i += 1
                        nx_graph.nodes[element_to_run][QualibrationGraph.LOOP_TARGETS_FIELD] = reuse_t
                        yield True
                    else:
                        yield False
                        return
                except StopIteration:
                    yield False
            elif max_iterations is not None and i < max_iterations:
                i += 1
                yield True
            else:
                yield False
                return

    def _run_element_loop_if_defined(self, element_to_run: GraphElementTypeVar) -> None:
        graph = self.q_graph
        nodes_parameters = graph.full_parameters.nodes
        element_to_run_parameters = getattr(nodes_parameters, element_to_run.name)
        run_start = datetime.now().astimezone()
        run_error: RunError | None = None
        try:
            self._active_element = element_to_run
            element_results = None
            loop_needed_generator = self._is_loop_iteration_needed(element_to_run)
            exc_info = None
            while loop_needed_generator.send(None):
                try:
                    logger.info(f"Run {element_to_run} in loop iteration")
                    element_results = self._execute_loop_iteration(element_to_run, element_to_run_parameters)
                except Exception as e:
                    logger.exception(
                        f"Failed to run {element_to_run} in loop iteration",
                        exc_info=e,
                    )
                    exc_info = e
                else:
                    exc_info = None
            if exc_info is not None:
                raise exc_info
            self._set_out_targets_for_element(element_to_run)
            logger.debug(f"Element completed. Result: {element_results}")
        except Exception as ex:
            new_status = ElementRunStatus.error
            self.nx_graph.nodes[element_to_run]["error"] = str(ex)
            logger.exception(
                (f"Failed to run element {element_to_run.name} in graph {graph.name}"),
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
            idx = element_to_run.snapshot_idx if isinstance(element_to_run, QualibrationNode) else None
            data = ItemData(
                parameters=element_to_run.parameters,
                outcomes=element_to_run.outcomes,
                error=run_error,
            )
            subitem_history = None
            if isinstance(element_to_run, QualibrationGraph) and (orch := element_to_run._orchestrator):
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
        self.nx_graph.nodes[element_to_run][QualibrationGraph.ELEMENT_STATUS_FIELD] = new_status

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

        # Create workflow snapshot at the start
        self._children_ids = []
        try:
            storage_manager = self._get_workflow_storage_manager()
            self._workflow_snapshot_idx = storage_manager.save_workflow_snapshot_start(
                graph, workflow_parent_id=self._workflow_parent_id
            )
            logger.info(
                f"Created workflow snapshot {self._workflow_snapshot_idx} "
                f"for graph {graph.name}"
            )
        except Exception as ex:
            logger.warning(
                f"Failed to create workflow snapshot for {graph.name}: {ex}"
            )
            self._workflow_snapshot_idx = None

        nx_graph = self.nx_graph
        successors = nx_graph.succ
        for node in _start_nodes(nx_graph):
            self._execution_queue.put(node)

        workflow_status = "finished"
        try:
            while not self._is_execution_finished() and not self._is_stopped:
                element_to_run = self.get_next_element()
                if element_to_run is None:
                    exc = RuntimeError("No next node. Execution not finished")
                    logger.exception("", exc_info=exc)
                    raise exc
                logger.info(f"Graph. Element to run. {element_to_run}")
                self._run_element_loop_if_defined(element_to_run)

                # Track child snapshot ID
                self._track_child_snapshot(element_to_run)

                status = nx_graph.nodes[element_to_run][
                    QualibrationGraph.ELEMENT_STATUS_FIELD
                ]
                if status == ElementRunStatus.error:
                    workflow_status = "error"
                if status == ElementRunStatus.finished:
                    for successor in successors[element_to_run]:
                        # skip diamond cases
                        # Example. Edges: 1 -> 2, 1 -> 3, 2 -> 4, 3 -> 4
                        # Start from 2. 4 skipped because 3 is skipped
                        if (
                            nx_graph.nodes[successor][
                                QualibrationGraph.ELEMENT_STATUS_FIELD
                            ]
                            == ElementRunStatus.skipped
                        ):
                            continue
                        # Skip successors if there are no targets to run, regardless
                        # of whether the edge represents success or failure.
                        if not nx_graph.edges[element_to_run, successor].get(
                            QualibrationGraph.EDGE_TARGETS_FIELD, []
                        ):
                            continue
                        self._execution_queue.put(successor)
        except Exception:
            workflow_status = "error"
            raise
        finally:
            self._active_element = None
            self._fill_final_outcomes()
            # Finalize workflow snapshot
            self._finalize_workflow_snapshot(graph, workflow_status)

    def _track_child_snapshot(
        self, element: GraphElementTypeVar
    ) -> None:
        """Track the child snapshot ID after an element completes."""
        if self._workflow_snapshot_idx is None:
            return

        child_id: int | None = None
        if isinstance(element, QualibrationNode):
            child_id = element.snapshot_idx
        elif isinstance(element, QualibrationGraph):
            # For nested graphs, get the workflow snapshot ID from its orchestrator
            if element._orchestrator is not None:
                orch = cast(BasicOrchestrator[Any], element._orchestrator)
                child_id = orch._workflow_snapshot_idx

        if child_id is not None:
            self._children_ids.append(child_id)
            try:
                storage_manager = self._get_workflow_storage_manager()
                storage_manager.update_snapshot_children(
                    self._workflow_snapshot_idx, child_id
                )
                # Also set the workflow parent on the child
                storage_manager.set_snapshot_workflow_parent(
                    child_id, self._workflow_snapshot_idx
                )
            except Exception as ex:
                logger.warning(
                    f"Failed to update children for workflow "
                    f"{self._workflow_snapshot_idx}: {ex}"
                )

    def _finalize_workflow_snapshot(
        self,
        graph: QualibrationGraph[GraphElementTypeVar],
        status: str,
    ) -> None:
        """Finalize the workflow snapshot with outcomes and status."""
        if self._workflow_snapshot_idx is None:
            return

        try:
            storage_manager = self._get_workflow_storage_manager()
            storage_manager.save_workflow_snapshot_end(
                graph,
                self._workflow_snapshot_idx,
                self._children_ids,
                self.final_outcomes,
                status=status,
            )
            logger.info(
                f"Finalized workflow snapshot {self._workflow_snapshot_idx} "
                f"for graph {graph.name} with status {status}"
            )
        except Exception as ex:
            logger.warning(
                f"Failed to finalize workflow snapshot "
                f"{self._workflow_snapshot_idx}: {ex}"
            )

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
        elements_without_successors = list(filter(lambda n: len(successors[n]) == 0, successors.keys()))
        final_targets = {target for element in elements_without_successors for target in element.outcomes}
        skipped_targets = set(self.initial_targets or []) - final_targets
        for target in final_targets:
            outcomes = [node.outcomes.get(target, Outcome.SUCCESSFUL) for node in elements_without_successors]
            successful = all(
                map(
                    lambda outcome: outcome == Outcome.SUCCESSFUL,
                    outcomes,
                )
            )
            self.final_outcomes[target] = Outcome.SUCCESSFUL if successful else Outcome.FAILED
        for skipped_target in skipped_targets:
            self.final_outcomes[skipped_target] = Outcome.FAILED


def _current_and_predecessors_statuses(
    graph: "nx.DiGraph[GraphElementTypeVar]",
    node: GraphElementTypeVar,
) -> bool:
    predecessors = graph.pred
    nodes = graph.nodes
    return bool(nodes[node][QualibrationGraph.ELEMENT_STATUS_FIELD] == ElementRunStatus.pending) and (
        sum(
            (nodes[predecessor][QualibrationGraph.ELEMENT_STATUS_FIELD] == ElementRunStatus.pending)
            for predecessor in predecessors[node]
        )
        == 0
    )


def _start_nodes(
    graph: "nx.DiGraph[GraphElementTypeVar]",
) -> Iterable[GraphElementTypeVar]:
    """Return nodes which have no predecessors with pending status"""
    predecessors = graph.pred
    return filter(
        lambda n: _current_and_predecessors_statuses(graph, n),
        predecessors.keys(),
    )
