from typing import Optional

from qualibrate import QualibrationGraph, QualibrationNode

from qualibrate_runner.config import State
from qualibrate_runner.core.models.active_run import (
    RunStatus,
    RunStatusGraph,
    RunStatusNode,
)
from qualibrate_runner.core.models.enums import RunStatusEnum
from qualibrate_runner.core.models.last_run import LastRun
from qualibrate_runner.core.types import QGraphType, QNodeType

__all__ = ["get_run_status"]


def get_node_status_enum(
    last_run: LastRun,
    node: QNodeType,
    graph: Optional[QGraphType],
) -> RunStatusEnum:
    if graph is None:
        return last_run.status
    if node.run_summary is None:
        return RunStatusEnum.RUNNING
    if node.run_summary.error is None:
        return RunStatusEnum.FINISHED
    return RunStatusEnum.ERROR


def get_node_run_status(
    last_run: LastRun, node: QNodeType, graph: Optional[QGraphType]
) -> RunStatusNode:
    return RunStatusNode(
        name=node.name,
        id=node.snapshot_idx or last_run.idx,
        status=get_node_status_enum(last_run, node, graph),
        run_start=node.run_start,
        current_action=node.current_action_name,
        run_end=last_run.completed_at,
        percentage_complete=node.fraction_complete * 100,
    )


def get_graph_and_node_run_status(
    last_run: LastRun, graph: QGraphType, node: Optional[QNodeType]
) -> tuple[RunStatusGraph, Optional[RunStatusNode]]:
    graph_status = RunStatusGraph(
        name=graph.name,
        run_start=graph.run_start,
        run_end=last_run.completed_at,
        status=last_run.status,
        finished_nodes=graph.completed_count(),
        total_nodes=len(graph._nodes),
    )
    orchestrator = graph._orchestrator
    execution_history = (
        orchestrator.get_execution_history().items if orchestrator else []
    )
    if node is not None or orchestrator is None or len(execution_history) == 0:
        return graph_status, None
    node_hist = execution_history[-1]
    node_status = RunStatusNode(
        name=node_hist.metadata.name,
        id=node_hist.id,
        status=RunStatusEnum.FINISHED,
        run_start=node_hist.metadata.run_start,
        run_end=node_hist.metadata.run_end,
        percentage_complete=100,
    )
    return graph_status, node_status


def get_run_status(state: State) -> RunStatus:
    last_run = state.last_run
    if last_run is None:
        return RunStatus()
    if isinstance(state.run_item, QualibrationNode):
        node: Optional[QNodeType] = state.run_item
        graph: Optional[QGraphType] = None
    elif isinstance(state.run_item, QualibrationGraph):
        graph = state.run_item
        node = (
            graph._orchestrator.active_node
            if graph._orchestrator is not None
            else None
        )
    else:
        node = None
        graph = None

    node_status: Optional[RunStatusNode] = None
    graph_status: Optional[RunStatusGraph] = None
    if node:
        node_status = get_node_run_status(last_run, node, graph)
    if graph:
        graph_status, node_graph_status = get_graph_and_node_run_status(
            last_run, graph, node
        )
        node_status = node_status or node_graph_status
    return RunStatus(node=node_status, graph=graph_status)
