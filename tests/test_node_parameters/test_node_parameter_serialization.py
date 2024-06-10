import numpy as np
from qualibrate.node_parameters import NodeParameters
from pydantic import Field


def test_parameters_empty_serialization():
    class Parameters(NodeParameters):
        pass

    parameters = Parameters()
    serialized = parameters.serialize()

    assert serialized == []


def test_parameters_default_types_serialization():
    class Parameters(NodeParameters):
        bool_val: bool = False
        int_val: int = 0
        float_val: float = 0.0
        str_val: str = ""

    parameters = Parameters()
    serialized = parameters.serialize()

    assert serialized == [
        {"name": "bool_val", "param_type": "bool", "initial_value": False},
        {"name": "int_val", "param_type": "int", "initial_value": 0},
        {"name": "float_val", "param_type": "float", "initial_value": 0.0},
        {"name": "str_val", "param_type": "str", "initial_value": ""},
    ]
