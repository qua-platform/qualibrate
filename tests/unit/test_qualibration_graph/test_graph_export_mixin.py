from qualibrate.models.node_status import ElementRunStatus
from qualibrate.parameters import (
    GraphParameters,
)
from qualibrate.qualibration_graph import QualibrationGraph
from qualibrate.qualibration_library import QualibrationLibrary
from qualibrate.utils.graph_building import GraphExportMixin


class TestGraphExportMixin:
    def test_export(
        self,
        qualibration_lib: QualibrationLibrary,
        graph_params: GraphParameters,
    ):
        g = QualibrationGraph(
            "name",
            graph_params,
            dict(qualibration_lib.nodes.items()),
            [("test_node", "one_more_node"), ("one_more_node", "test_cal")],
        )
        assert GraphExportMixin.nx_graph_export(
            g._graph, node_names_only=True
        ) == {
            "nodes": [
                {
                    "status": ElementRunStatus.pending,
                    "retries": 0,
                    "id": "test_node",
                },
                {
                    "status": ElementRunStatus.pending,
                    "retries": 0,
                    "id": "one_more_node",
                },
                {
                    "status": ElementRunStatus.pending,
                    "retries": 0,
                    "id": "test_cal",
                },
            ],
            # this is standard name so kept as is
            "adjacency": [[{"id": "one_more_node"}], [{"id": "test_cal"}], []],
        }

    def test_cytoscape(self):
        serialized = {
            "name": "name",
            "parameters": {},
            "description": None,
            "orchestrator": {},
            "nodes": {
                "test_node": {
                    "status": "pending",
                    "retries": 0,
                    "id": "test_node",
                    "name": "test_node",
                    "parameters": {},
                },
                "one_more_node": {
                    "status": "pending",
                    "retries": 0,
                    "id": "one_more_node",
                    "name": "one_more_node",
                    "parameters": {},
                },
                "test_cal": {
                    "status": "pending",
                    "retries": 0,
                    "id": "test_cal",
                    "name": "test_cal",
                    "parameters": {},
                },
            },
            "connectivity": [
                ("test_node", "one_more_node"),
                ("one_more_node", "test_cal"),
            ],
        }
        assert GraphExportMixin.cytoscape_representation(serialized) == [
            {
                "group": "nodes",
                "data": {"id": "test_node"},
                "position": {"x": 100, "y": 100},
            },
            {
                "group": "nodes",
                "data": {"id": "one_more_node"},
                "position": {"x": 100, "y": 100},
            },
            {
                "group": "nodes",
                "data": {"id": "test_cal"},
                "position": {"x": 100, "y": 100},
            },
            {
                "group": "edges",
                "data": {
                    "id": "test_node_one_more_node",
                    "source": "test_node",
                    "target": "one_more_node",
                },
            },
            {
                "group": "edges",
                "data": {
                    "id": "one_more_node_test_cal",
                    "source": "one_more_node",
                    "target": "test_cal",
                },
            },
        ]
