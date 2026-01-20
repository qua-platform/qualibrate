from pydantic import Field

from qualibrate.core.parameters import RunnableParameters


def test_parameters_empty_serialization():
    class Parameters(RunnableParameters):
        qubits: list[str] = Field(default_factory=list)

    parameters = Parameters()
    serialized = parameters.serialize()

    assert serialized == {
        "qubits": {
            "items": {"type": "string"},
            "title": "Qubits",
            "type": "array",
        }
    }


def test_parameters_default_types_serialization():
    class Parameters(RunnableParameters):
        qubits: list[str] = Field(default_factory=list)
        bool_val: bool = False
        int_val: int = 0
        float_val: float = 0.0
        str_val: str = ""

    parameters = Parameters()
    serialized = parameters.serialize()

    assert serialized == {
        "bool_val": {
            "default": False,
            "title": "Bool Val",
            "type": "boolean",
        },
        "int_val": {"default": 0, "title": "Int Val", "type": "integer"},
        "float_val": {
            "default": 0.0,
            "title": "Float Val",
            "type": "number",
        },
        "str_val": {"default": "", "title": "Str Val", "type": "string"},
        "qubits": {
            "items": {"type": "string"},
            "title": "Qubits",
            "type": "array",
        },
    }
