import warnings
from dataclasses import asdict
from datetime import datetime
from pathlib import Path

import numpy as np
import pytest
import xarray as xr
from matplotlib import pyplot as plt
from quam.components import BasicQuAM, SingleChannel

from qualibrate.parameters import NodeParameters
from qualibrate.qualibration_node import QualibrationNode


@pytest.fixture
def empty_nodes_dump_folder(tmp_path):
    nodes_path = tmp_path / "nodes_path"
    nodes_path.mkdir(exist_ok=True, parents=True)
    yield nodes_path


@pytest.fixture
def empty_node_dir(empty_nodes_dump_folder):
    date = empty_nodes_dump_folder / datetime.today().strftime("%Y-%m-%d")
    time = datetime.now().time().strftime("%H%M%S")
    node = date / f"#1_name_{time}"
    (date / node).mkdir(exist_ok=True, parents=True)
    yield node


def test_load_from_id_class_empty(
    empty_nodes_dump_folder: Path,
    empty_node_dir: Path,
    qualibrate_config_and_path_mocked,
):
    loaded_node = QualibrationNode.load_from_id(
        1, base_path=empty_nodes_dump_folder
    )
    assert loaded_node is not None
    assert isinstance(loaded_node.parameters, NodeParameters)
    assert loaded_node.parameters.model_fields == {}
    assert loaded_node.machine is None
    assert loaded_node.results == {}


def test_load_from_id_class_filled(
    nodes_dumps_dir: Path,
    qualibrate_config_and_path_mocked,
):
    loaded_node = QualibrationNode.load_from_id(1, base_path=nodes_dumps_dir)
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


@pytest.fixture
def node_for_dump(
    mocker,
    qualibrate_config_and_path_mocked,
):
    mocker.patch("qualibrate.qualibration_node.logger")

    class Parameters(NodeParameters):
        resonator: str
        sampling_points: int = 100
        noise_factor: float = 0.1
        wait_time: float = 4

        def some_method(self):
            print("some_method")

    node = QualibrationNode(
        name="test_cal",
        parameters=Parameters(resonator="q1.resonator"),
    )

    node.machine = BasicQuAM(
        channels={
            "ch1": SingleChannel(
                opx_output=("con1", 1), intermediate_frequency=100e6
            ),
            "ch2": SingleChannel(
                opx_output=("con1", 2), intermediate_frequency=80e6
            ),
        }
    )
    fig, ax = plt.subplots()
    xvals = np.linspace(-10, 10, node.parameters.sampling_points)
    offset = np.random.rand() * 3
    gaussian = np.exp(-((xvals + offset) ** 2))
    noise = node.parameters.noise_factor * np.random.rand(
        node.parameters.sampling_points
    )
    yvals = gaussian + noise
    arr = xr.Dataset(
        data_vars={
            "signal": xr.DataArray(yvals, dims=["freq"], coords={"freq": xvals})
        }
    )

    ax.plot(xvals, yvals)
    ax.set_xlabel("Frequency shift (Hz)")
    ax.set_ylabel("Signal amplitude (a.u.)")

    node.results = {"frequency_shift": offset, "results_fig": fig, "arr": arr}
    return node


def test_save_and_load(mocker, tmp_path, node_for_dump, qualibrate_config):
    warnings.filterwarnings("error", category=UserWarning)

    copied_params = node_for_dump.parameters.model_copy(deep=True)
    copied_results = node_for_dump.results.copy()
    state_path = tmp_path / "state_path"
    state_path.mkdir()
    mocker.patch(
        "qualibrate.qualibration_node.get_quam_state_path",
        return_value=state_path,
    )
    node_for_dump.save()
    assert node_for_dump.storage_manager is not None
    assert isinstance(node_for_dump.storage_manager.snapshot_idx, int)
    with warnings.catch_warnings():
        warnings.filterwarnings(
            "ignore", category=UserWarning, module="quam.core.quam_classes"
        )
        restored_node = QualibrationNode.load_from_id(
            node_for_dump.storage_manager.snapshot_idx,
            base_path=qualibrate_config.storage.location,
        )

    assert copied_params.model_dump() == restored_node.parameters.model_dump()
    assert isinstance(restored_node.machine, BasicQuAM)
    assert asdict(restored_node.machine) == asdict(node_for_dump.machine)
    restored_results = node_for_dump.results
    assert restored_node.results.keys() == copied_results.keys()
    assert (
        restored_results["frequency_shift"] == copied_results["frequency_shift"]
    )
    assert restored_results["arr"].equals(copied_results["arr"])
    assert np.array_equal(
        restored_results["results_fig"].get_size_inches(),
        copied_results["results_fig"].get_size_inches(),
    )
