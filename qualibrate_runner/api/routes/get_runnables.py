from collections.abc import Mapping, Sequence
from typing import Annotated, Any

from fastapi import APIRouter, Depends
from qualibrate.runnables.runnable_collection import RunnableCollection

from qualibrate_runner.api.dependencies import get_graph_nocopy as get_qgraph
from qualibrate_runner.api.dependencies import get_graphs as get_qgraphs
from qualibrate_runner.api.dependencies import (
    get_node_nocopy as get_qnode,
)
from qualibrate_runner.api.dependencies import (
    get_nodes as get_qnodes,
)
from qualibrate_runner.core.types import QGraphType, QNodeType

get_runnables_router = APIRouter()


@get_runnables_router.get("/get_nodes")
def get_nodes(
    nodes: Annotated[RunnableCollection[str, QNodeType], Depends(get_qnodes)],
) -> Mapping[str, Any]:
    return {
        node_name: node.serialize(exclude_targets=False)
        for node_name, node in nodes.items_nocopy()
    }


@get_runnables_router.get("/get_graphs")
def get_graphs(
    graphs: Annotated[RunnableCollection[str, QNodeType], Depends(get_qgraphs)],
    cytoscape: bool = False,
) -> Mapping[str, Any]:
    return {
        graph_name: graph.serialize(cytoscape=cytoscape)
        for graph_name, graph in graphs.items_nocopy()
    }


@get_runnables_router.get("/get_node")
def get_node(
    node: Annotated[QNodeType, Depends(get_qnode)],
) -> Mapping[str, Any]:
    return node.serialize(exclude_targets=True)


@get_runnables_router.get("/get_graph")
def get_graph(
    graph: Annotated[QGraphType, Depends(get_qgraph)],
    cytoscape: bool = False,
) -> Mapping[str, Any]:
    return graph.serialize(cytoscape=cytoscape)


@get_runnables_router.get("/get_graph/cytoscape")
def get_graph_cytoscape(
    graph: Annotated[QGraphType, Depends(get_qgraph)],
) -> Sequence[Mapping[str, Any]]:
    return graph.cytoscape_representation(graph.serialize())
