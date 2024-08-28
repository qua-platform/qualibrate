from pathlib import Path
from typing import Any, Dict, Mapping, Optional, cast

from qualibrate.parameters import (
    ExecutionParameters,
    NodeParameters,
)
from qualibrate.qualibration_graph import QualibrationGraph
from qualibrate.qualibration_node import QualibrationNode

__all__ = ["QualibrationLibrary"]

from qualibrate.run_summary.graph import GraphRunSummary
from qualibrate.run_summary.node import NodeRunSummary


class QualibrationLibrary:
    active_library: Optional["QualibrationLibrary"] = None

    def __init__(
        self, library_folder: Optional[Path] = None, set_active: bool = True
    ):
        self.nodes: Dict[str, QualibrationNode] = {}
        self.graphs: Dict[str, QualibrationGraph] = {}

        if set_active:
            self.__class__.active_library = self

        if library_folder:
            self.nodes = cast(
                Dict[str, QualibrationNode],
                QualibrationNode.scan_folder_for_instances(
                    library_folder, self
                ),
            )
            self.graphs = cast(
                Dict[str, QualibrationGraph],
                QualibrationGraph.scan_folder_for_instances(
                    library_folder, self
                ),
            )

    def serialize(self) -> Mapping[str, Any]:
        return {"nodes": [node.serialize() for node in self.nodes.values()]}

    def get_nodes(self) -> Mapping[str, QualibrationNode]:
        return self.nodes

    def get_graphs(self) -> Mapping[str, QualibrationGraph]:
        return self.graphs

    def run_node(
        self, node_name: str, input_parameters: NodeParameters
    ) -> NodeRunSummary:
        node = self.nodes[node_name]
        return cast(NodeRunSummary, node.run(**input_parameters.model_dump()))

    def run_graph(
        self, graph_name: str, input_parameters: ExecutionParameters
    ) -> GraphRunSummary:
        graph = self.graphs[graph_name]
        return cast(
            GraphRunSummary,
            graph.run(
                nodes=input_parameters.nodes.model_dump(),
                **input_parameters.parameters.model_dump(),
            ),
        )
