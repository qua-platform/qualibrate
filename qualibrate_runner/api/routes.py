from typing import Annotated, Any, Mapping, Optional, Type, cast

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, status
from pydantic import BaseModel
from qualibrate.qualibration_graph import QualibrationGraph
from qualibrate.qualibration_node import QualibrationNode

from qualibrate_runner.api.dependencies import (
    cache_clear,
    get_library,
    get_state,
)
from qualibrate_runner.api.dependencies import (
    get_graph as get_qgraph,
)
from qualibrate_runner.api.dependencies import (
    get_graphs as get_qgraphs,
)
from qualibrate_runner.api.dependencies import (
    get_node as get_qnode,
)
from qualibrate_runner.api.dependencies import (
    get_nodes as get_qnodes,
)
from qualibrate_runner.config import (
    QualibrateRunnerSettings,
    State,
    get_settings,
)
from qualibrate_runner.core.models.last_run import LastRun, RunStatus
from qualibrate_runner.core.run_job import (
    run_node,
    run_workflow,
    validate_input_parameters,
)

base_router = APIRouter()


@base_router.get("/is_running")
def check_running(
    state: Annotated[State, Depends(get_state)],
) -> bool:
    return state.is_running


@base_router.post("/submit/node")
def submit_node_run(
    input_parameters: Mapping[str, Any],
    state: Annotated[State, Depends(get_state)],
    node: Annotated[QualibrationNode, Depends(get_qnode)],
    background_tasks: BackgroundTasks,
) -> str:
    # TODO:
    #  this should unify graph submit node params and node submit params
    #  It's needed to correct validation models
    if "parameters" in input_parameters:
        input_parameters = input_parameters["parameters"]
    if state.is_running:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Already running",
        )
    validate_input_parameters(
        cast(Type[BaseModel], node.parameters_class), input_parameters
    )
    background_tasks.add_task(run_node, node, input_parameters, state)
    return f"Node job {node.name} is submitted"


@base_router.post("/submit/workflow")
def submit_workflow_run(
    input_parameters: Mapping[str, Any],
    state: Annotated[State, Depends(get_state)],
    graph: Annotated[QualibrationGraph, Depends(get_qgraph)],
    background_tasks: BackgroundTasks,
) -> str:
    if state.is_running:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Already running",
        )
    input_parameters = {
        "parameters": input_parameters.get("parameters", {}),
        "nodes": {
            name: params.get("parameters", {})
            for name, params in input_parameters.get("nodes", {}).items()
        },
    }
    validate_input_parameters(
        cast(Type[BaseModel], graph.full_parameters), input_parameters
    )
    background_tasks.add_task(run_workflow, graph, input_parameters, state)
    return f"Workflow job {graph.name} is submitted"


@base_router.get("/get_nodes")
def get_nodes(
    nodes: Annotated[Mapping[str, QualibrationNode], Depends(get_qnodes)],
    settings: Annotated[QualibrateRunnerSettings, Depends(get_settings)],
    rescan: bool = False,
) -> Mapping[str, Any]:
    if rescan:
        cache_clear()
        library = get_library(settings)
        nodes = get_qnodes(library)
    return {node_name: node.serialize() for node_name, node in nodes.items()}


@base_router.get("/get_graphs")
def get_graphs(
    graphs: Annotated[Mapping[str, QualibrationNode], Depends(get_qgraphs)],
    settings: Annotated[QualibrateRunnerSettings, Depends(get_settings)],
    rescan: bool = False,
    cytoscape: bool = False,
) -> Mapping[str, Any]:
    if rescan:
        cache_clear()
        library = get_library(settings)
        graphs = get_qgraphs(library)
    return {
        graph_name: graph.serialize(cytoscape=cytoscape)
        for graph_name, graph in graphs.items()
    }


@base_router.get("/get_node")
def get_node(
    node: Annotated[QualibrationNode, Depends(get_qnode)],
) -> Mapping[str, Any]:
    return cast(Mapping[str, Any], node.serialize())


@base_router.get("/get_graph")
def get_graph(
    graph: Annotated[QualibrationGraph, Depends(get_qgraph)],
    cytoscape: bool = False,
) -> Mapping[str, Any]:
    return cast(Mapping[str, Any], graph.serialize(cytoscape=cytoscape))


@base_router.get("/last_run")
def get_last_run(
    state: Annotated[State, Depends(get_state)],
) -> Optional[LastRun]:
    return state.last_run


@base_router.post(
    "/record_state_update",
    description=(
        "Record that a state update entry belonging to the last run has been "
        "updated. This changed the state_updates entry to True  but does not "
        "update the snapshot."
    ),
)
def state_updated(
    state: Annotated[State, Depends(get_state)],
    key: str,
) -> Optional[LastRun]:
    if state.last_run is None or state.last_run.status != RunStatus.FINISHED:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Node not executed or finished unsuccessful.",
        )
    state_updates = state.last_run.state_updates
    if key not in state_updates:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Unknown state update key.",
        )
    state_updates[key].updated = True
    return state.last_run
