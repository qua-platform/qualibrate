from typing import Annotated, Any, Mapping, Sequence, cast

from fastapi import APIRouter, Depends
from qualibrate.qualibration_graph import QualibrationGraph
from qualibrate.qualibration_node import QualibrationNode

from qualibrate_runner.api.dependencies import (
    cache_clear,
    get_library,
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
    get_settings,
)

get_runnables_router = APIRouter()


@get_runnables_router.get("/get_nodes")
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


@get_runnables_router.get("/get_graphs")
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


@get_runnables_router.get("/get_node")
def get_node(
    node: Annotated[QualibrationNode, Depends(get_qnode)],
) -> Mapping[str, Any]:
    return cast(Mapping[str, Any], node.serialize())


@get_runnables_router.get("/get_graph")
def get_graph(
    graph: Annotated[QualibrationGraph, Depends(get_qgraph)],
    cytoscape: bool = False,
) -> Mapping[str, Any]:
    return cast(Mapping[str, Any], graph.serialize(cytoscape=cytoscape))


@get_runnables_router.get("/get_graph/cytoscape")
def get_graph_cytoscape(
    graph: Annotated[QualibrationGraph, Depends(get_qgraph)],
) -> Sequence[Mapping[str, Any]]:
    return cast(
        Sequence[Mapping[str, Any]],
        graph.cytoscape_representation(graph.serialize()),
    )
