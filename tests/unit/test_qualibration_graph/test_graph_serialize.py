from collections.abc import Sequence
from typing import Any

from qualibrate.models.node_status import ElementRunStatus
from qualibrate.orchestration.qualibration_orchestrator import (
    QualibrationOrchestrator,
)
from qualibrate.parameters import (
    GraphParameters,
)
from qualibrate.qualibration_graph import QualibrationGraph
from qualibrate.qualibration_library import QualibrationLibrary


class Orchestrator(QualibrationOrchestrator):
    def traverse_graph(
        self, graph: QualibrationGraph, targets: Sequence[Any]
    ) -> None:
        pass


def test_serialize_with_no_nested_graphs(
    qualibration_lib: QualibrationLibrary, graph_params: GraphParameters
):
    g = QualibrationGraph(
        "name",
        graph_params,
        dict(qualibration_lib.nodes.items()),
        [("test_node", "one_more_node"), ("one_more_node", "test_cal")],
        orchestrator=Orchestrator(),
        description="some description",
    )
    assert g.serialize() == {
        "name": "name",
        "description": "some description",
        "orchestrator": {
            "__class__": (
                "tests.unit.test_qualibration_graph.test_graph_serialize"
                ".Orchestrator"
            ),
            "parameters": {},
        },
        "nodes": {
            "test_node": {
                "status": ElementRunStatus.pending,
                "id": "test_node",
                "name": "test_node",
                "parameters": {
                    "str_value": {
                        "default": "test",
                        "title": "Str Value",
                        "type": "string",
                        "is_targets": False,
                    },
                    "int_value": {
                        "default": 1,
                        "title": "Int Value",
                        "type": "integer",
                        "is_targets": False,
                    },
                    "float_value": {
                        "default": 1.0,
                        "title": "Float Value",
                        "type": "number",
                        "is_targets": False,
                    },
                },
            },
            "one_more_node": {
                "status": ElementRunStatus.pending,
                "id": "one_more_node",
                "name": "one_more_node",
                "parameters": {
                    "str_value": {
                        "default": "test",
                        "title": "Str Value",
                        "type": "string",
                        "is_targets": False,
                    },
                    "float_value": {
                        "default": 1.0,
                        "title": "Float Value",
                        "type": "number",
                        "is_targets": False,
                    },
                },
            },
            "test_cal": {
                "status": ElementRunStatus.pending,
                "id": "test_cal",
                "name": "test_cal",
                "parameters": {
                    "resonator": {
                        "default": "q1.resonator",
                        "title": "Resonator",
                        "type": "string",
                        "is_targets": False,
                    },
                    "sampling_points": {
                        "default": 100,
                        "title": "Sampling Points",
                        "type": "integer",
                        "is_targets": False,
                    },
                },
            },
        },
        "connectivity": [
            ("test_node", "one_more_node"),
            ("one_more_node", "test_cal"),
        ],
        "parameters": {
            "retries": {
                "default": 1,
                "is_targets": False,
                "title": "Retries",
                "type": "integer",
            },
            "qubits": {
                "is_targets": True,
                "items": {"type": "string"},
                "title": "Qubits",
                "type": "array",
            },
        },
    }


def test_serialize_with_nested_graphs(
    qualibration_lib: QualibrationLibrary, graph_params: GraphParameters
):
    g = qualibration_lib.graphs["workflow_top"]
    assert g.serialize_graph_representation() == {
        "nodes": [
            {
                "name": "subg",
                "loop": False,
                "data": {
                    "label": "subg",
                    "subgraph": {
                        "nodes": [
                            {
                                "name": "test_cal",
                                "loop": False,
                                "data": {"label": "test_cal"},
                            },
                            {
                                "name": "one_more_node",
                                "loop": False,
                                "data": {"label": "one_more_node"},
                            },
                        ],
                        "edges": [
                            {
                                "id": "test_cal->one_more_node",
                                "source": "test_cal",
                                "target": "one_more_node",
                                "data": {
                                    "connect_on": True,
                                    "operational_condition": False,
                                },
                            }
                        ],
                    },
                },
            },
            {"name": "test_cal", "loop": False, "data": {"label": "test_cal"}},
        ],
        "edges": [
            {
                "id": "subg->test_cal",
                "source": "subg",
                "target": "test_cal",
                "data": {
                    "connect_on": True,
                    "operational_condition": False,
                },
            }
        ],
    }


def test_serialize_with_nested_graphs_and_connect_on_failure(
    qualibration_lib: QualibrationLibrary, graph_params: GraphParameters
):
    g = qualibration_lib.graphs["workflow_top_connect_on_failure"]
    assert g.serialize_graph_representation() == {
        "nodes": [
            {
                "name": "subg",
                "loop": False,
                "data": {
                    "label": "subg",
                    "subgraph": {
                        "nodes": [
                            {
                                "name": "test_cal",
                                "loop": False,
                                "data": {"label": "test_cal"},
                            },
                            {
                                "name": "one_more_node",
                                "loop": False,
                                "data": {"label": "one_more_node"},
                            },
                        ],
                        "edges": [
                            {
                                "id": "test_cal->one_more_node",
                                "source": "test_cal",
                                "target": "one_more_node",
                                "data": {
                                    "connect_on": False,
                                    "operational_condition": False,
                                },
                            }
                        ],
                    },
                },
            },
            {"name": "test_cal", "loop": False, "data": {"label": "test_cal"}},
        ],
        "edges": [
            {
                "id": "subg->test_cal",
                "source": "subg",
                "target": "test_cal",
                "data": {"connect_on": True, "operational_condition": False},
            }
        ],
    }


def test_serialize_graph_with_operational_condition_and_loop(
        qualibration_lib: QualibrationLibrary, graph_params: GraphParameters
):
    """Test serialization of graph with operational conditions and loop."""
    g = qualibration_lib.graphs["graph_with_operational_condition_and_loop"]

    serialized = g.serialize_graph_representation()

    # Should have 4 nodes
    assert len(serialized["nodes"]) == 4

    # Should have 3 edges (1 success, 2 failure)
    assert len(serialized["edges"]) == 3

    # Find node (the one with loop)
    node = next(n for n in serialized["nodes"] if n["data"]["label"] == "node")
    assert node["loop"] is True
    assert node["data"]["condition"] is True  # Has loop condition
    assert node["data"]["on_failure"] is False  # Not a loop on failure
    # Note: max_iterations might not be set if only 'on' was specified

    # Find edges
    edges = serialized["edges"]

    # Find success edge (node -> node4)
    node_id = node["id"]
    node4 = next(n for n in serialized["nodes"] if n["data"]["label"] == "node4")
    success_edge = next(
        e for e in edges
        if e["source"] == node_id and e["target"] == node4["id"]
    )
    assert success_edge["data"]["connect"] is True  # Success path
    assert success_edge["data"]["operational_condition"] is False  # No condition on success

    # Find failure edges with conditions
    node2 = next(n for n in serialized["nodes"] if n["data"]["label"] == "node2")
    node2_edge = next(
        e for e in edges
        if e["source"] == node_id and e["target"] == node2["id"]
    )
    assert node2_edge["data"]["connect"] is False  # Failure path
    assert node2_edge["data"]["operational_condition"] is True  # Has condition
    assert "condition_label" in node2_edge["data"]
    assert node2_edge["data"]["condition_label"] == "<lambda>"  # Lambda function
    assert "condition_description" in node2_edge["data"]

    node3 = next(n for n in serialized["nodes"] if n["data"]["label"] == "node3")
    node3_edge = next(
        e for e in edges
        if e["source"] == node_id and e["target"] == node3["id"]
    )
    assert node3_edge["data"]["connect"] is False  # Failure path
    assert node3_edge["data"]["operational_condition"] is True  # Has condition
    assert "condition_label" in node3_edge["data"]
    assert node3_edge["data"]["condition_label"] == "<lambda>"  # Lambda function


def test_serialize_graph_with_multiple_operational_conditions(
        qualibration_lib: QualibrationLibrary, graph_params: GraphParameters
):
    """Test that both failure edges with different conditions are properly serialized."""
    g = qualibration_lib.graphs["graph_with_operational_condition_and_loop"]

    serialized = g.serialize_graph_representation()
    edges = serialized["edges"]

    # Count edges by type
    success_edges = [e for e in edges if e["data"]["connect"] is True]
    failure_edges = [e for e in edges if e["data"]["connect"] is False]

    assert len(success_edges) == 1
    assert len(failure_edges) == 2

    # Both failure edges should have operational conditions
    for edge in failure_edges:
        assert edge["data"]["operational_condition"] is True
        assert "condition_label" in edge["data"]
        assert "condition_description" in edge["data"]
        assert edge["data"]["condition_label"] == "<lambda>"  # Both are lambdas
