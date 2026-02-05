from collections.abc import Callable, Mapping, Sequence
from functools import wraps
from typing import (
    TYPE_CHECKING,
    Any,
    Concatenate,
    Generic,
    ParamSpec,
    TypeVar,
    cast,
)

import networkx as nx

from qualibrate.core.parameters import RunnableParameters
from qualibrate.core.q_runnnable import QRunnable

if TYPE_CHECKING:
    from qualibrate.core.qualibration_graph import QualibrationGraph

GraphElementTypeVar = TypeVar(
    "GraphElementTypeVar",
    bound=QRunnable[RunnableParameters, RunnableParameters],
)

P = ParamSpec("P")
R = TypeVar("R")


def ensure_finalized(
    fn: Callable[Concatenate["QualibrationGraph[Any]", P], R],
) -> Callable[Concatenate["QualibrationGraph[Any]", P], R]:
    """Decorator to block method calls beforw finalize()."""

    @wraps(fn)
    def wrapper(self: "QualibrationGraph[Any]", *args: P.args, **kwargs: P.kwargs) -> R:
        if not self._finalized:
            raise RuntimeError(f"Cannot call {fn.__name__}() because the graph isn't finalized yet.")
        return fn(self, *args, **kwargs)

    return cast(Callable[Concatenate["QualibrationGraph[Any]", P], R], wrapper)


def ensure_not_finalized(
    fn: Callable[Concatenate["QualibrationGraph[Any]", P], R],
) -> Callable[Concatenate["QualibrationGraph[Any]", P], R]:
    """Decorator to block method calls after finalize()."""

    @wraps(fn)
    def wrapper(self: "QualibrationGraph[Any]", *args: P.args, **kwargs: P.kwargs) -> R:
        if self._finalized:
            raise RuntimeError(f"Cannot call {fn.__name__}() because the graph is already finalized.")
        return fn(self, *args, **kwargs)

    return cast(Callable[Concatenate["QualibrationGraph[Any]", P], R], wrapper)


def ensure_building(
    fn: Callable[Concatenate["QualibrationGraph[Any]", P], R],
) -> Callable[Concatenate["QualibrationGraph[Any]", P], R]:
    """Decorator to allow method calls only during build phase."""

    @wraps(fn)
    def wrapper(self: "QualibrationGraph[Any]", *args: P.args, **kwargs: P.kwargs) -> R:
        if not getattr(self, "_building", False):
            raise RuntimeError(f"Cannot call {fn.__name__}() because the graph is not in build mode.")
        return fn(self, *args, **kwargs)

    return cast(Callable[Concatenate["QualibrationGraph[Any]", P], R], wrapper)


class GraphExportMixin(Generic[GraphElementTypeVar]):
    @staticmethod
    def nx_graph_export(graph: "nx.DiGraph[GraphElementTypeVar]", node_names_only: bool = False) -> Mapping[str, Any]:
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
            for node, adjacency in zip(data["nodes"], data["adjacency"], strict=False):
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
