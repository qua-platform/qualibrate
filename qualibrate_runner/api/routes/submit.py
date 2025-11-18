from collections.abc import Mapping
from typing import Annotated, Any, cast

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, status
from pydantic import BaseModel

from qualibrate_runner.api.dependencies import get_graph_nocopy as get_qgraph
from qualibrate_runner.api.dependencies import get_node_copy as get_qnode_copy
from qualibrate_runner.api.dependencies import (
    get_state,
)
from qualibrate_runner.config import (
    State,
)
from qualibrate_runner.core.run_job import (
    run_node,
    run_workflow,
    validate_input_parameters,
)
from qualibrate_runner.core.types import QGraphType, QNodeType

submit_router = APIRouter(prefix="/submit")


def _recursive_clear_node_parameters(
    parameters: Mapping[str, Any],
) -> Mapping[str, Any]:
    """
    Recursively clear run parameters of submitted elements.
    Based on qualibrate.parameters.ExecutionParameters.

    Expected out structure:
    ```python
    {
        "parameters": {
            "p1": ...
        },
        "nodes": {
            "subgraph1": {
                "parameters": {
                    "p2": ...
                },
                "nodes": {
                    "subgraph_node1": {
                        "p3": 120,
                    },
                    "subgraph_node2": {
                        "p5": 100,
                    }
                }
            },
            "outer_graph_node1": {
                "p7": 120,
            }
        }
    }
    ```
    """
    if "nodes" in parameters and "parameters" in parameters:
        return {
            "parameters": parameters["parameters"],
            "nodes": {
                name: _recursive_clear_node_parameters(params)
                for name, params in parameters["nodes"].items()
            },
        }
    if "parameters" in parameters:
        return dict(parameters["parameters"])
    return parameters


def clear_input_parameters(
    input_parameters: Mapping[str, Any],
) -> Mapping[str, Any]:
    return _recursive_clear_node_parameters(input_parameters)


@submit_router.post("/node")
def submit_node_run(
    input_parameters: Annotated[
        Mapping[str, Any], Depends(clear_input_parameters)
    ],
    state: Annotated[State, Depends(get_state)],
    node: Annotated[QNodeType, Depends(get_qnode_copy)],
    background_tasks: BackgroundTasks,
) -> str:
    if state.is_running:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Already running",
        )
    validate_input_parameters(
        cast(type[BaseModel], node.parameters_class), input_parameters
    )
    background_tasks.add_task(run_node, node, input_parameters, state)
    return f"Node job {node.name} is submitted"


@submit_router.post("/workflow")
def submit_workflow_run(
    input_parameters: Annotated[
        Mapping[str, Any], Depends(clear_input_parameters)
    ],
    state: Annotated[State, Depends(get_state)],
    graph: Annotated[QGraphType, Depends(get_qgraph)],
    background_tasks: BackgroundTasks,
) -> str:
    if state.is_running:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Already running",
        )
    validate_input_parameters(graph.full_parameters_class, input_parameters)
    background_tasks.add_task(run_workflow, graph, input_parameters, state)
    return f"Workflow job {graph.name} is submitted"
