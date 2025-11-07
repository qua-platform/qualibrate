from collections.abc import Mapping, Sequence
from typing import (
    Any,
    Generic,
    TypeVar,
)

import networkx as nx

from qualibrate.parameters import RunnableParameters
from qualibrate.q_runnnable import QRunnable

GraphElementTypeVar = TypeVar(
    "GraphElementTypeVar",
    bound=QRunnable[RunnableParameters, RunnableParameters],
)


class GraphExportMixin(Generic[GraphElementTypeVar]):
    @staticmethod
    def nx_graph_export(
        graph: nx.DiGraph[GraphElementTypeVar], node_names_only: bool = False
    ) -> Mapping[str, Any]:
        """
        Exports the graph as a networkx adjacency list.

        Args:
            graph: networkx graph to export
            node_names_only (bool): If True, only node names are included in
                the adjacency list. Defaults to False.

        Returns:
            Mapping[str, Any]: A dictionary representing the adjacency list of
            the graph.
        """
        data = dict(nx.readwrite.adjacency_data(graph))
        for key in ("multigraph", "directed", "graph"):
            data.pop(key)
        if node_names_only:
            for node, adjacency in zip(
                data["nodes"], data["adjacency"], strict=False
            ):
                node["id"] = node["id"].name
                for adj in adjacency:
                    adj["id"] = adj["id"].name
        return data

    @staticmethod
    def cytoscape_representation(
        serialized: Mapping[str, Any],
    ) -> Sequence[Mapping[str, Any]]:
        """
        Returns a Cytoscape-compatible representation of the graph.

        This method generates nodes and edges in a format that can be used with
        Cytoscape for visualization purposes.

        Args:
            serialized (Mapping[str, Any]): Serialized representation of the
                graph.

        Returns:
            Sequence[Mapping[str, Any]]: List of nodes and edges for Cytoscape
                visualization.
        """
        nodes = [
            {
                "group": "nodes",
                "data": {"id": node},
                "position": {"x": 100, "y": 100},
            }
            for node in serialized["nodes"]
        ]
        edges = [
            {
                "group": "edges",
                "data": {
                    "id": f"{source}_{dest}",
                    "source": source,
                    "target": dest,
                },
            }
            for source, dest in serialized["connectivity"]
        ]
        return [*nodes, *edges]
