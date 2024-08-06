from qualibrate import QualibrationNode, NodeParameters
from quam.components import *
import numpy as np
from time import sleep
from matplotlib import pyplot as plt


class Parameters(NodeParameters):
    resonator: str = "q1.resonator"
    sampling_points: int = 100


node = QualibrationNode(
    name="test_cal",
    parameters_class=Parameters,
    description="Test calibration that wait a few seconds, then plots random data.",
)
machine = node.machine
# node.mode.interactive = True


machine = BasicQuAM(
    channels={
        "ch1": SingleChannel(opx_output=("con1", 1), intermediate_frequency=100e6)
    }
)

node.parameters = Parameters()

# Sleep for a few seconds to simulate the calibration
sleep(4)

fig, ax = plt.subplots()
ax.plot(np.random.rand(node.parameters.sampling_points))

node.results = {"resonator_val": node.parameters.resonator, "results_fig": fig}

with node.record_state_updates():
    machine.channels["ch1"].intermediate_frequency = 50e6

node.save()
