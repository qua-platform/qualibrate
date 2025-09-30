from qualibrate import QualibrationGraph, QualibrationNode
from qualibrate.models.execution_history import ExecutionHistory

from qualibrate_runner.config import State
from qualibrate_runner.core.models.active_run import (
    RunStatus,
    RunStatusGraph,
    RunStatusNode,
)
from qualibrate_runner.core.models.enums import RunStatusEnum
from qualibrate_runner.core.models.last_run import LastRun
from qualibrate_runner.core.models.run_results import RunResults
from qualibrate_runner.core.types import QGraphType, QNodeType

__all__ = [
    "get_graph_and_node_run_status",
    "get_graph_execution_history",
    "get_node_run_status",
    "get_run_status",
]


def get_node_status_enum(
    last_run: LastRun,
    node: QNodeType,
    graph: QGraphType | None,
) -> RunStatusEnum:
    if graph is None:
        return last_run.status
    if node.run_summary is None:
        return RunStatusEnum.RUNNING
    if node.run_summary.error is None:
        return RunStatusEnum.FINISHED
    return RunStatusEnum.ERROR


def get_node_run_status(
    last_run: LastRun, node: QNodeType, graph: QGraphType | None
) -> RunStatusNode:
    return RunStatusNode(
        name=node.name,
        description=node.description,
        parameters=node.parameters.model_dump(mode="json"),
        id=node.snapshot_idx or last_run.idx,
        status=get_node_status_enum(last_run, node, graph),
        run_start=node.run_start,
        current_action=node.action_label,
        run_end=last_run.completed_at,
        percentage_complete=node.fraction_complete * 100,
        run_results=(
            RunResults.model_validate(node.run_summary.model_dump())
            if node.run_summary
            else None
        ),
    )


def get_graph_and_node_run_status(
    last_run: LastRun, graph: QGraphType, node: QNodeType | None
) -> tuple[RunStatusGraph, RunStatusNode | None]:
    graph_status = RunStatusGraph(
        name=graph.name,
        description=graph.description,
        parameters=graph.full_parameters.model_dump(mode="json"),
        status=last_run.status,
        run_start=graph.run_start,
        run_end=last_run.completed_at,
        finished_nodes=graph.completed_count(),
        total_nodes=len(graph._nodes),
        run_results=(
            RunResults.model_validate(graph.run_summary.model_dump())
            if graph.run_summary
            else None
        ),
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
        description=node_hist.metadata.description,
        parameters=node_hist.data.parameters.model_dump(mode="json"),
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
        node: QNodeType | None = state.run_item
        graph: QGraphType | None = None
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

    node_status: RunStatusNode | None = None
    graph_status: RunStatusGraph | None = None
    if node:
        node_status = get_node_run_status(last_run, node, graph)
    if graph:
        graph_status, node_graph_status = get_graph_and_node_run_status(
            last_run, graph, node
        )
        node_status = node_status or node_graph_status
    return RunStatus(
        is_running=state.is_running,
        runnable_type=last_run.runnable_type,
        node=node_status,
        graph=graph_status,
    )


def get_graph_execution_history(
    state: State, reverse: bool = False
) -> ExecutionHistory | None:
    if not isinstance(state.run_item, QualibrationGraph):
        return None
    graph: QGraphType = state.run_item
    orch = graph._orchestrator
    if orch is None:
        raise RuntimeError("No graph orchestrator")
    history: ExecutionHistory = orch.get_execution_history()
    if reverse:
        history.items = list(reversed(history.items))
    return history
