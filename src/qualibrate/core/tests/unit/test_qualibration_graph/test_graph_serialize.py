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
                "data": {
                    "label": "subg",
                    "subgraph": {
                        "nodes": [
                            {
                                "name": "test_cal",
                                "data": {"label": "test_cal"},
                            },
                            {
                                "name": "one_more_node",
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
                                },
                            }
                        ],
                    },
                },
            },
            {"name": "test_cal", "data": {"label": "test_cal"}},
        ],
        "edges": [
            {
                "id": "subg->test_cal",
                "source": "subg",
                "target": "test_cal",
                "data": {
                    "connect_on": True,
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
                "data": {
                    "label": "subg",
                    "subgraph": {
                        "nodes": [
                            {
                                "name": "test_cal",
                                "data": {"label": "test_cal"},
                            },
                            {
                                "name": "one_more_node",
                                "data": {"label": "one_more_node"},
                            },
                            {
                                "name": "test_node",
                                "data": {"label": "test_node"},
                            },
                        ],
                        "edges": [
                            {
                                "id": "test_cal->one_more_node",
                                "source": "test_cal",
                                "target": "one_more_node",
                                "data": {
                                    "connect_on": False,
                                },
                            },
                            {
                                "id": "test_cal->test_node",
                                "source": "test_cal",
                                "target": "test_node",
                                "data": {
                                    "connect_on": True,
                                },
                            },
                        ],
                    },
                },
            },
            {"name": "test_cal", "data": {"label": "test_cal"}},
        ],
        "edges": [
            {
                "id": "subg->test_cal",
                "source": "subg",
                "target": "test_cal",
                "data": {
                    "connect_on": True,
                },
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

    # Should have 4 edges (1 success, 2 failure, 1 loop self-edge)
    assert len(serialized["edges"]) == 4

    # Find node (the one with loop)
    node_data = next(
        n for n in serialized["nodes"] if n["data"]["label"] == "node"
    )
    node_name = node_data["name"]

    # Find edges
    edges = serialized["edges"]

    # Find the loop self-edge (node -> node)
    loop_edge = next((e for e in edges if e["source"] == e["target"]), None)
    assert loop_edge is not None
    assert loop_edge["id"] == f"{node_name}->{node_name}"
    # Check for loop-specific fields
    # (adjust based on actual _add_loop_to_edge implementation)
    assert "data" in loop_edge
    # The loop edge should have max_iterations field
    assert "loop" in loop_edge["data"]
    assert "max_iterations" in loop_edge["data"]["loop"]

    # Find success edge (node -> node4)
    node4_data = next(
        n for n in serialized["nodes"] if n["data"]["label"] == "node4"
    )
    node4_name = node4_data["name"]
    success_edge = next(
        e
        for e in edges
        if e["source"] == node_name and e["target"] == node4_name
    )
    assert success_edge["data"]["connect_on"] is True  # Success path

    # Find failure edges with conditions
    node2_data = next(
        n for n in serialized["nodes"] if n["data"]["label"] == "node2"
    )
    node2_name = node2_data["name"]
    node2_edge = next(
        e
        for e in edges
        if e["source"] == node_name and e["target"] == node2_name
    )
    assert node2_edge["data"]["connect_on"] is False  # Failure path
    assert "condition" in node2_edge["data"]
    assert node2_edge["data"]["condition"]["label"] == "<lambda>"
    assert "description" in node2_edge["data"]["condition"]

    node3_data = next(
        n for n in serialized["nodes"] if n["data"]["label"] == "node3"
    )
    node3_name = node3_data["name"]
    node3_edge = next(
        e
        for e in edges
        if e["source"] == node_name and e["target"] == node3_name
    )
    assert node3_edge["data"]["connect_on"] is False  # Failure path
    assert "label" in node3_edge["data"]["condition"]
    assert (
        node3_edge["data"]["condition"]["label"] == "<lambda>"
    )  # Lambda function


def test_serialize_graph_with_multiple_operational_conditions(
    qualibration_lib: QualibrationLibrary, graph_params: GraphParameters
):
    """Test that both failure edges with different
    conditions are properly serialized."""
    g = qualibration_lib.graphs["graph_with_operational_condition_and_loop"]

    serialized = g.serialize_graph_representation()
    edges = serialized["edges"]

    # Count edges by type (excluding self-loop)
    non_loop_edges = [e for e in edges if e["source"] != e["target"]]
    success_edges = [
        e for e in non_loop_edges if e["data"]["connect_on"] is True
    ]
    failure_edges = [
        e for e in non_loop_edges if e["data"]["connect_on"] is False
    ]

    assert len(success_edges) == 1
    assert len(failure_edges) == 2

    # Both failure edges should have operational conditions
    for edge in failure_edges:
        # assert edge["data"]["operational_condition"] is True
        assert "label" in edge["data"]["condition"]
        assert "description" in edge["data"]["condition"]
        assert edge["data"]["condition"]["description"] is not None
