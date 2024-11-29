from pathlib import Path

from qualibrate.parameters import NodeParameters
from qualibrate.qualibration_node import QualibrationNode


def test_load_from_id_class_empty(nodes_dumps_dir: Path):
    loaded_node = QualibrationNode.load_from_id(1, base_path=nodes_dumps_dir)
    assert loaded_node is not None
    assert isinstance(loaded_node.parameters, NodeParameters)
    assert loaded_node.parameters.model_fields == {}
    assert loaded_node.machine is None
    assert loaded_node.results == {}


def test_load_from_id_class_filled(nodes_dumps_dir: Path):
    loaded_node = QualibrationNode.load_from_id(2, base_path=nodes_dumps_dir)
    assert loaded_node is not None
    assert isinstance(loaded_node.parameters, NodeParameters)
    assert loaded_node.parameters.model_dump() == {
        "qubits": ["c", "b"],
        "str_value": "test",
        "int_value": 4,
        "float_value": 1.0,
        "bool_value": False,
        "list_str": ["a", "b"],
        "list_int": [1, 2],
        "list_float": [1.1, 2.2],
        "list_bool": [True, False],
    }
    assert loaded_node.machine == {
        "channels": {
            "ch1": {"opx_output": ["con1", 1], "__class__": "CustomChannel"}
        },
        "__class__": "quam.components.basic_quam.BasicQuAM",
    }
