from qualibrate import QualibrationNode
from qualibrate.core.parameters import NodeParameters


class Parameters(NodeParameters):
    qubits: list[str] = ["q1","q2","q3"]
    str_value: str = "test"
    int_value: int = 1
    float_value: float = 1.0

    req_value : int

node = QualibrationNode("test_state", parameters=Parameters(req_value=1, int_value=5))


from random import randint

from quam.components import BasicQuam, SingleChannel

node.machine = machine =  BasicQuam(channels={"ch1": SingleChannel(opx_output=("con1", 1), intermediate_frequency=100e6),
                         "ch2":SingleChannel(opx_output=("con1", 2), intermediate_frequency=75e6), "ch3":SingleChannel(opx_output=("con1", 3), intermediate_frequency=125e6)})

channel = machine.channels["ch1"]

assert channel.intermediate_frequency == 100e6

with node.record_state_updates(interactive_only=False):
    channel.intermediate_frequency = 50e6
node.machine = machine

print("run node")
import time

time.sleep(2)

if node.parameters and node.parameters.targets is not None:
    node.outcomes = {
        target: "successful" if bool(randint(0,1)) else "failed" for target in node.parameters.targets
    }

node.results = {
    "str_val" : node.parameters.str_value,
    "int_val" : node.parameters.int_value,
    "float_val" : node.parameters.float_value
}
node.save()


