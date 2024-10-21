import pytest
from pydantic import Field

from qualibrate import NodeParameters, QualibrationNode


@pytest.fixture
def node():
    class Parameters(NodeParameters):
        qubits: list[str] = Field(default_factory=list)

        str_value: str = "test"
        int_value: int = 1
        float_value: float = 1.0

    node = QualibrationNode("test_node", parameters=Parameters())
    return node


@pytest.fixture
def machine():
    from quam.components import BasicQuAM, SingleChannel

    machine = BasicQuAM(
        channels={
            "ch1": SingleChannel(
                opx_output=("con1", 1), intermediate_frequency=100e6
            )
        },
    )
    return machine
