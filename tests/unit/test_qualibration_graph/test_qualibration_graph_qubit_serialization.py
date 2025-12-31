from typing import Any
from unittest.mock import Mock

import pytest

from qualibrate import GraphParameters, NodeParameters, QualibrationGraph, QualibrationNode

MOCK_QUBITS_FIDELITIES = {
    "q1": 0.99,
    "q2": 0.95,
    "q3": 0.98,
    "q4": None,
}

ACTIVE_QUBITS = {"q1", "q3"}
class MockQubit:
    """Mock qubit class for testing"""

    def __init__(self, name: str, gate_fidelity_value: float | None = None):
        self.name = name
        if gate_fidelity_value is not None:
            self.gate_fidelity = Mock()
            self.gate_fidelity.averaged = gate_fidelity_value
        else:
            self.gate_fidelity = Mock(spec=[])


class MockMachine:
    """Mock machine class for testing"""

    def __init__(
            self, qubits_dict: dict[str, Any], active_qubits_list: list[MockQubit]
    ):
        self.qubits = qubits_dict
        self.active_qubits = active_qubits_list


def _active_qubits_names(mocked_machine: MockMachine) -> list[str]:
    return [active_qubit.name for active_qubit in mocked_machine.active_qubits]


# Custom parameters classes with qubits field
class NodeParametersWithQubits(NodeParameters):
    qubits: list[str] = []


class GraphParametersWithQubits(GraphParameters):
    qubits: list[str] = []


class TestGraphSerialization:
    """Test suite for QualibrationGraph.serialize() qubit metadata"""

    @pytest.fixture
    def mock_library(self, mocker):
        """Mock the QualibrationLibrary to avoid initialization issues"""
        mock_lib = mocker.MagicMock()
        mock_lib.nodes.values_nocopy.return_value = []  # Empty library
        mocker.patch.object(
            QualibrationGraph,
            "_get_library",
            return_value=mock_lib,
        )
        return mock_lib


    @pytest.fixture
    def mock_qubits(self):
        """Create mock qubits with various configurations"""
        return {
            name: MockQubit(name, fidelity)
            for name, fidelity in MOCK_QUBITS_FIDELITIES.items()
        }

    @pytest.fixture
    def mock_machine(self, mock_qubits):
        """Create a mock machine with qubits"""
        active_qubits = [mock_qubits["q1"], mock_qubits["q3"]]
        return MockMachine(mock_qubits, active_qubits)

    @pytest.fixture
    def node_with_machine(self, mocker, mock_machine):
        """Create a node with machine and qubits parameters"""
        mocker.patch.object(QualibrationNode, "_get_storage_manager")
        node = QualibrationNode(
            name="test_node",
            parameters=NodeParametersWithQubits(qubits=["q1", "q2", "q3"]),
            machine=mock_machine
        )
        return node

    @pytest.fixture
    def node_without_machine(self, mocker):
        """Create a node without machine"""
        mocker.patch.object(QualibrationNode, "_get_storage_manager")
        node = QualibrationNode(
            name="test_node",
            parameters=NodeParametersWithQubits(qubits=["q1", "q2"])
        )
        return node

    @pytest.fixture
    def simple_graph_with_nodes(self, mocker, node_with_machine, mock_library):
        """Create a simple graph with nodes that have machines"""
        mocker.patch.object(QualibrationNode, "_get_storage_manager")

        node1 = node_with_machine.copy(name="node1")
        node2 = node_with_machine.copy(name="node2")

        with QualibrationGraph.build(
                "test_graph",
                parameters=GraphParametersWithQubits(qubits=["q1", "q2", "q3"])
        ) as graph:
            graph.add_node(node1)
            graph.add_node(node2)
            graph.connect("node1", "node2")

        return graph

    def test_serialize_graph_without_qubits_in_parameters(
            self, mocker, node_with_machine, mock_library
    ):
        """Test graph serialization when parameters don't have qubits field"""
        mocker.patch.object(QualibrationNode, "_get_storage_manager")

        node1 = node_with_machine.copy(name="node1")

        with QualibrationGraph.build(
                "test_graph",
                parameters=GraphParameters()  # No qubits field
        ) as graph:
            graph.add_node(node1)

        result = graph.serialize()

        assert isinstance(result, dict)
        # Should not have qubits metadata when parameters don't have qubits
        if "parameters" in result:
            assert "qubits" not in result["parameters"] or \
                   "metadata" not in result["parameters"].get("qubits", {})

    def test_serialize_graph_with_nodes_having_machines(
            self, simple_graph_with_nodes, mock_qubits
    ):
        """Test graph serialization when all nodes have machines"""
        result = simple_graph_with_nodes.serialize()

        assert isinstance(result, dict)
        assert "parameters" in result
        assert "qubits" in result["parameters"]
        assert "metadata" in result["parameters"]["qubits"]

        metadata = result["parameters"]["qubits"]["metadata"]

        # Check all qubits are in metadata
        assert set(metadata.keys()) == set(mock_qubits.keys())

        # Check active qubits
        for qubit_name in metadata:
            if qubit_name in ["q1", "q3"]:
                assert metadata[qubit_name]["active"] is True
            else:
                assert metadata[qubit_name]["active"] is False

        # Check fidelity values
        assert metadata["q1"]["fidelity"] == 0.99
        assert metadata["q2"]["fidelity"] == 0.95
        assert metadata["q3"]["fidelity"] == 0.98
        assert metadata["q4"]["fidelity"] is None

    def test_serialize_graph_with_node_without_machine(
            self, mocker, node_with_machine, node_without_machine, mock_library
    ):
        """Test graph serialization when one node doesn't have machine"""
        mocker.patch.object(QualibrationNode, "_get_storage_manager")

        node1 = node_with_machine.copy(name="node1")
        node2 = node_without_machine.copy(name="node2")

        with QualibrationGraph.build(
                "test_graph",
                parameters=GraphParametersWithQubits(qubits=["q1", "q2"])
        ) as graph:
            graph.add_node(node1)
            graph.add_node(node2)
            graph.connect("node1", "node2")

        result = graph.serialize()

        if "parameters" in result and "qubits" in result["parameters"]:
            assert result["parameters"]["qubits"]["metadata"]

    def test_serialize_graph_with_different_machines(
            self, mocker, mock_qubits, mock_library
    ):
        """Test graph serialization when nodes have different machines"""
        mocker.patch.object(QualibrationNode, "_get_storage_manager")

        # Create two different machines
        machine1 = MockMachine(mock_qubits, [mock_qubits["q1"]])
        machine2_qubits = {
            "q1": MockQubit("q1", 0.88),  # Different fidelity
            "q2": MockQubit("q2", 0.92),
        }
        machine2 = MockMachine(machine2_qubits, [machine2_qubits["q1"]])

        node1 = QualibrationNode(
            name="node1",
            parameters=NodeParametersWithQubits(qubits=["q1", "q2"]),
            machine=machine1
        )

        node2 = QualibrationNode(
            name="node2",
            parameters=NodeParametersWithQubits(qubits=["q1", "q2"]),
            machine=machine2
        )

        with QualibrationGraph.build(
                "test_graph",
                parameters=GraphParametersWithQubits(qubits=["q1", "q2"])
        ) as graph:
            graph.add_node(node1)
            graph.add_node(node2)
            graph.connect("node1", "node2")

        result = graph.serialize()

        # Should not have metadata because machines are different
        if "parameters" in result and "qubits" in result["parameters"]:
            assert "metadata" not in result["parameters"]["qubits"]

    def test_serialize_graph_with_single_node(
            self, mocker, node_with_machine, mock_library
    ):
        """Test graph serialization with single node"""
        mocker.patch.object(QualibrationNode, "_get_storage_manager")

        node1 = node_with_machine.copy(name="node1")

        with QualibrationGraph.build(
                "test_graph",
                parameters=GraphParametersWithQubits(qubits=["q1", "q2"])
        ) as graph:
            graph.add_node(node1)

        result = graph.serialize()

        assert "parameters" in result
        assert "qubits" in result["parameters"]
        assert "metadata" in result["parameters"]["qubits"]

    def test_serialize_empty_graph(self, mocker, mock_library):
        """Test graph serialization with no nodes"""
        mocker.patch.object(QualibrationNode, "_get_storage_manager")

        with QualibrationGraph.build(
                "test_graph",
                parameters=GraphParametersWithQubits(qubits=["q1", "q2"])
        ) as graph:
            pass  # No nodes added

        result = graph.serialize()

        # Should not have metadata because no nodes
        if "parameters" in result and "qubits" in result["parameters"]:
            assert "metadata" not in result["parameters"]["qubits"]

    def test_serialize_graph_metadata_structure(self, simple_graph_with_nodes):
        """Test the structure of metadata in graph serialization"""
        result = simple_graph_with_nodes.serialize()
        metadata = result["parameters"]["qubits"]["metadata"]

        for qubit_data in metadata.values():
            # Each qubit should have exactly these keys
            assert set(qubit_data.keys()) == {"active", "fidelity"}
            # active should be boolean
            assert isinstance(qubit_data["active"], bool)
            # fidelity should be float or None
            assert qubit_data["fidelity"] is None or isinstance(
                qubit_data["fidelity"], float
            )

    def test_serialize_graph_preserves_base_data(self, simple_graph_with_nodes):
        """Test that serialize preserves all base graph serialization data"""
        result = simple_graph_with_nodes.serialize()

        # Should have base fields
        assert "name" in result
        assert result["name"] == "test_graph"
        assert "parameters" in result
        assert "nodes" in result
        assert "connectivity" in result

    def test_serialize_graph_with_nodes_no_qubits_attribute(
            self, mocker, mock_library
    ):
        """Test graph serialization when node parameters don't have qubits"""
        mocker.patch.object(QualibrationNode, "_get_storage_manager")

        node1 = QualibrationNode(
            name="node1",
            parameters=NodeParameters()  # No qubits field
        )

        with QualibrationGraph.build(
                "test_graph",
                parameters=GraphParametersWithQubits(qubits=["q1"])
        ) as graph:
            graph.add_node(node1)

        result = graph.serialize()

        # Should not have metadata because node doesn't have qubits in parameters
        if "parameters" in result and "qubits" in result["parameters"]:
            assert "metadata" not in result["parameters"]["qubits"]


class TestNestedGraphSerialization:
    """Test suite for nested graph (subgraph) serialization"""

    @pytest.fixture
    def mock_library(self, mocker):
        """Mock the QualibrationLibrary"""
        mock_lib = mocker.MagicMock()
        mock_lib.nodes.values_nocopy.return_value = []
        mocker.patch.object(
            QualibrationGraph,
            "_get_library",
            return_value=mock_lib,
        )
        return mock_lib

    @pytest.fixture
    def mock_qubits(self):
        """Create mock qubits"""
        qubits = {
            "q1": MockQubit("q1", 0.99),
            "q2": MockQubit("q2", 0.95),
        }
        return qubits

    @pytest.fixture
    def mock_machine(self, mock_qubits):
        """Create a mock machine"""
        active_qubits = [mock_qubits["q1"]]
        return MockMachine(mock_qubits, active_qubits)

    @pytest.fixture
    def node_with_machine(self, mocker, mock_machine):
        """Create a node with machine"""
        mocker.patch.object(QualibrationNode, "_get_storage_manager")
        node = QualibrationNode(
            name="test_node",
            parameters=NodeParametersWithQubits(qubits=["q1", "q2"]),
            machine=mock_machine
        )
        return node

    @pytest.fixture
    def subgraph_with_nodes(self, mocker, node_with_machine, mock_library):
        """Create a subgraph with nodes"""
        mocker.patch.object(QualibrationNode, "_get_storage_manager")

        node1 = node_with_machine.copy(name="subnode1")
        node2 = node_with_machine.copy(name="subnode2")

        with QualibrationGraph.build(
                "subgraph",
                parameters=GraphParametersWithQubits(qubits=["q1", "q2"])
        ) as subgraph:
            subgraph.add_node(node1)
            subgraph.add_node(node2)
            subgraph.connect("subnode1", "subnode2")

        return subgraph

    def test_serialize_graph_with_subgraph(
            self, mocker, node_with_machine, subgraph_with_nodes, mock_qubits, mock_library
    ):
        """Test serialization of graph containing subgraph"""
        mocker.patch.object(QualibrationNode, "_get_storage_manager")

        node1 = node_with_machine.copy(name="node1")

        with QualibrationGraph.build(
                "parent_graph",
                parameters=GraphParametersWithQubits(qubits=["q1", "q2"])
        ) as parent_graph:
            parent_graph.add_node(node1)
            parent_graph.add_node(subgraph_with_nodes)
            parent_graph.connect("node1", "subgraph")

        result = parent_graph.serialize()

        # Parent graph should have metadata
        assert "parameters" in result
        assert "qubits" in result["parameters"]
        assert "metadata" in result["parameters"]["qubits"]

        metadata = result["parameters"]["qubits"]["metadata"]
        assert set(metadata.keys()) == set(mock_qubits.keys())

    def test_serialize_graph_with_subgraph_no_metadata(
            self, mocker, node_with_machine, mock_qubits, mock_library
    ):
        """Subgraph has nodes without machines; parent graph collects valid metadata from nodes that do"""
        mocker.patch.object(QualibrationNode, "_get_storage_manager")

        # Create subgraph with node without machine
        node_no_machine = QualibrationNode(
            name="subnode1",
            parameters=NodeParametersWithQubits(qubits=["q1"])
        )

        with QualibrationGraph.build(
                "subgraph",
                parameters=GraphParametersWithQubits(qubits=["q1"])
        ) as subgraph:
            subgraph.add_node(node_no_machine)

        node1 = node_with_machine.copy(name="node1")

        with QualibrationGraph.build(
                "parent_graph",
                parameters=GraphParametersWithQubits(qubits=["q1", "q2"])
        ) as parent_graph:
            parent_graph.add_node(node1)
            parent_graph.add_node(subgraph)
            parent_graph.connect("node1", "subgraph")

        result = parent_graph.serialize()

        metadata = result["parameters"]["qubits"]["metadata"]
        assert metadata
        assert "q1" in metadata


class TestGraphSerializationEdgeCases:
    """Test edge cases for graph serialization"""

    @pytest.fixture
    def mock_library(self, mocker):
        """Mock the QualibrationLibrary"""
        mock_lib = mocker.MagicMock()
        mock_lib.nodes.values_nocopy.return_value = []
        mocker.patch.object(
            QualibrationGraph,
            "_get_library",
            return_value=mock_lib,
        )
        return mock_lib

    @pytest.fixture
    def mock_machine(self):
        """Create a mock machine"""
        qubits = {
            "q1": MockQubit("q1", 0.99),
        }
        return MockMachine(qubits, [qubits["q1"]])

    def test_serialize_graph_with_many_identical_nodes(
            self, mocker, mock_machine, mock_library
    ):
        """Test serialization with many nodes having identical machines"""
        mocker.patch.object(QualibrationNode, "_get_storage_manager")

        # Create multiple nodes with same machine
        nodes = []
        for i in range(10):
            node = QualibrationNode(
                name=f"node{i}",
                parameters=NodeParametersWithQubits(qubits=["q1"]),
                machine=mock_machine
            )
            nodes.append(node)

        with QualibrationGraph.build(
                "test_graph",
                parameters=GraphParametersWithQubits(qubits=["q1"])
        ) as graph:
            for node in nodes:
                graph.add_node(node)

            # Connect in chain
            for i in range(len(nodes) - 1):
                graph.connect(f"node{i}", f"node{i + 1}")

        result = graph.serialize()

        # Should have metadata since all machines are identical
        assert "parameters" in result
        assert "qubits" in result["parameters"]
        assert "metadata" in result["parameters"]["qubits"]
        assert result["parameters"]["qubits"]["metadata"]["q1"]["fidelity"] == 0.99

    def test_serialize_graph_with_machine_missing_attributes(
            self, mocker, mock_library
    ):
        """Test serialization when machine is missing some attributes"""
        mocker.patch.object(QualibrationNode, "_get_storage_manager")

        # Machine with only qubits, no active_qubits
        machine = Mock(spec=["qubits"])
        machine.qubits = {"q1": MockQubit("q1", 0.99)}

        node = QualibrationNode(
            name="node1",
            parameters=NodeParametersWithQubits(qubits=["q1"]),
            machine=machine
        )

        with QualibrationGraph.build(
                "test_graph",
                parameters=GraphParametersWithQubits(qubits=["q1"])
        ) as graph:
            graph.add_node(node)

        result = graph.serialize()

        # Should not crash but also should not have metadata
        assert isinstance(result, dict)
        if "parameters" in result and "qubits" in result["parameters"]:
            assert "metadata" not in result["parameters"]["qubits"]

    def test_serialize_graph_with_complex_connectivity(
            self, mocker, mock_machine, mock_library
    ):
        """Test serialization with complex graph connectivity"""
        mocker.patch.object(QualibrationNode, "_get_storage_manager")

        nodes = []
        for i in range(4):
            node = QualibrationNode(
                name=f"node{i}",
                parameters=NodeParametersWithQubits(qubits=["q1"]),
                machine=mock_machine
            )
            nodes.append(node)

        with QualibrationGraph.build(
                "test_graph",
                parameters=GraphParametersWithQubits(qubits=["q1"])
        ) as graph:
            for node in nodes:
                graph.add_node(node)

            # Create diamond pattern
            graph.connect("node0", "node1")
            graph.connect("node0", "node2")
            graph.connect("node1", "node3")
            graph.connect("node2", "node3")

        result = graph.serialize()

        # Should still have metadata regardless of connectivity pattern
        assert "metadata" in result["parameters"]["qubits"]