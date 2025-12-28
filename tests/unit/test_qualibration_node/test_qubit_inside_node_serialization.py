from typing import Any
from unittest.mock import Mock

import pytest

from qualibrate import QualibrationNode
from qualibrate.parameters import NodeParameters


class MockQubit:
    """Mock qubit class for testing"""

    def __init__(self, name: str, gate_fidelity_value: float | None = None):
        self.name = name
        if gate_fidelity_value is not None:
            self.gate_fidelity = Mock()
            self.gate_fidelity.averaged = gate_fidelity_value
        else:
            self.gate_fidelity = Mock(spec=[])  # No 'averaged' attribute


class MockMachine:
    """Mock machine class for testing"""

    def __init__(
        self, qubits_dict: dict[str, Any], active_qubits_list: list[MockQubit]
    ):
        self.qubits = qubits_dict
        self.active_qubits = active_qubits_list


def _active_qubits_names(mocked_machine: MockMachine) -> list[str]:
    return [active_qubit.name for active_qubit in mocked_machine.active_qubits]


class TestNodeSerialization:
    """Test suite for QualibrationNode.serialize() method"""

    @pytest.fixture
    def base_node(self):
        """Create a basic node without machine for testing"""
        node = QualibrationNode(name="test_node", parameters=NodeParameters())
        return node

    @pytest.fixture
    def mock_qubits(self):
        """Create mock qubits with various configurations"""
        qubits = {
            "qA1": MockQubit("qA1", 0.9607522653458166),
            "qA2": MockQubit("qA2", 0.9789885462390904),
            "qA3": MockQubit("qA3", 0.9987151301821622),
            "qA4": MockQubit("qA4", None),  # No fidelity
            "qA5": MockQubit("qA5", 1.0000000657302262),
        }
        return qubits

    @pytest.fixture
    def node_with_machine(self, base_node, mock_qubits):
        """Create a node with a machine that has qubits"""
        active_qubits = [
            mock_qubits["qA1"],
            mock_qubits["qA2"],
            mock_qubits["qA3"],
        ]

        machine = MockMachine(mock_qubits, active_qubits)
        base_node.machine = machine
        return base_node

    def test_serialize_without_machine(self, base_node):
        """Test serialization when machine is None"""
        result = base_node.serialize()

        assert isinstance(result, dict)
        assert "name" in result
        assert result["name"] == "test_node"
        # Should not have qubits metadata when machine is None
        if "parameters" in result and "qubits" in result["parameters"]:
            assert "metadata" not in result["parameters"]["qubits"]

    def test_serialize_with_machine_no_attributes(self, base_node):
        """Test serialization when machine lacks required attributes"""
        base_node.machine = Mock(
            spec=[]
        )  # Machine without active_qubits or qubits

        result = base_node.serialize()

        assert isinstance(result, dict)
        # Should not have qubits metadata when machine lacks attributes
        if "parameters" in result and "qubits" in result["parameters"]:
            assert "metadata" not in result["parameters"]["qubits"]

    def test_serialize_with_complete_machine(
        self, node_with_machine, mock_qubits
    ):
        """Test serialization with a complete machine setup"""
        result = node_with_machine.serialize()

        assert isinstance(result, dict)
        assert "parameters" in result
        assert "qubits" in result["parameters"]
        assert "metadata" in result["parameters"]["qubits"]

        metadata = result["parameters"]["qubits"]["metadata"]

        # Check all qubits are in metadata
        assert set(metadata.keys()) == set(mock_qubits.keys())

        # Check active qubits, this is based on the node_with_machine fixture
        active_qubits_names = _active_qubits_names(node_with_machine.machine)

        for qubit in metadata:
            assert (metadata[qubit]["active"]) == (qubit in active_qubits_names)

        # Check fidelity values
        assert (
            metadata["qA1"]["fidelity"]
            == mock_qubits["qA1"].gate_fidelity.averaged
        )
        assert (
            metadata["qA2"]["fidelity"]
            == mock_qubits["qA2"].gate_fidelity.averaged
        )
        assert (
            metadata["qA3"]["fidelity"]
            == mock_qubits["qA3"].gate_fidelity.averaged
        )
        # qA4 doesn't have gate_fidelity.averaged, so accessing it should raise
        # AttributeError
        with pytest.raises(AttributeError):
            _ = mock_qubits["qA4"].gate_fidelity.averaged
        assert metadata["qA4"]["fidelity"] is None
        assert (
            metadata["qA5"]["fidelity"]
            == mock_qubits["qA5"].gate_fidelity.averaged
        )

    def test_serialize_active_qubit_identification(
        self, base_node, mock_qubits
    ):
        """Test that active qubits are correctly identified"""
        active_qubits = [mock_qubits["qA1"], mock_qubits["qA3"]]
        machine = MockMachine(mock_qubits, active_qubits)
        base_node.machine = machine

        result = base_node.serialize()
        metadata = result["parameters"]["qubits"]["metadata"]
        active_qubits_names = _active_qubits_names(machine)

        # Only qA1 and qA3 should be activ
        for qubit in metadata:
            assert (metadata[qubit]["active"]) == (qubit in active_qubits_names)

    def test_serialize_qubit_without_gate_fidelity(self, base_node):
        """Test serialization when qubit doesn't have gate_fidelity attribute"""
        qubits = {
            "qA1": Mock(spec=["name"]),  # No gate_fidelity attribute
        }
        qubits["qA1"].name = "qA1"

        machine = MockMachine(qubits, [])
        base_node.machine = machine

        result = base_node.serialize()
        metadata = result["parameters"]["qubits"]["metadata"]

        assert metadata["qA1"]["active"] not in base_node.machine.active_qubits
        assert metadata["qA1"]["fidelity"] is None

    def test_serialize_qubit_without_averaged_fidelity(self, base_node):
        """Test serialization when gate_fidelity doesn't
        have 'averaged' attribute"""
        qubits = {
            "qA1": Mock(),
        }
        qubits["qA1"].name = "qA1"
        qubits["qA1"].gate_fidelity = Mock(spec=[])  # No 'averaged' attribute

        machine = MockMachine(qubits, [])
        base_node.machine = machine

        result = base_node.serialize()
        metadata = result["parameters"]["qubits"]["metadata"]

        assert metadata["qA1"]["fidelity"] is None

    def test_serialize_empty_qubits(self, base_node):
        """Test serialization with empty qubits dictionary"""
        machine = MockMachine({}, [])
        base_node.machine = machine

        result = base_node.serialize()

        assert "parameters" in result
        assert "qubits" in result["parameters"]
        assert "metadata" in result["parameters"]["qubits"]
        assert result["parameters"]["qubits"]["metadata"] == {}

    def test_serialize_preserves_base_data(self, node_with_machine):
        """Test that serialize preserves all base class serialization data"""
        result = node_with_machine.serialize()

        # Should have base fields from QRunnable
        assert "name" in result
        assert result["name"] == "test_node"

        # Should have parameters field
        assert "parameters" in result

    def test_serialize_metadata_structure(self, node_with_machine):
        """Test the structure of metadata for each qubit"""
        result = node_with_machine.serialize()
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


class TestNodeSerializationEdgeCases:
    """Test edge cases and error conditions"""

    def test_serialize_with_partial_machine_attributes(self):
        """Test machine with only some attributes"""
        node = QualibrationNode(name="test", parameters=NodeParameters())

        # Machine with only active_qubits
        node.machine = Mock(spec=["active_qubits"])
        node.machine.active_qubits = []

        result = node.serialize()
        assert isinstance(result, dict)

        # Machine with only qubits
        node.machine = Mock(spec=["qubits"])
        node.machine.qubits = Mock()
        node.machine.qubits.keys = Mock(return_value=[])

        result = node.serialize()
        assert isinstance(result, dict)

    def test_serialize_large_number_of_qubits(self):
        """Test serialization with a large number of qubits"""
        node = QualibrationNode(name="test", parameters=NodeParameters())

        # Create 100 qubits
        qubits = {
            f"q{i}": MockQubit(f"q{i}", 0.95 + i * 0.0001) for i in range(100)
        }

        active_qubits = [
            qubits[f"q{i}"] for i in range(0, 100, 2)
        ]  # Every other qubit
        machine = MockMachine(qubits, active_qubits)
        node.machine = machine

        result = node.serialize()
        metadata = result["parameters"]["qubits"]["metadata"]

        assert len(metadata) == len(qubits)
        # Check some active/inactive states
        active_qubits_names = _active_qubits_names(machine)
        assert "q0" in active_qubits_names
        assert "q1" not in active_qubits_names
        assert "q50" in active_qubits_names
        assert "q51" not in active_qubits_names
