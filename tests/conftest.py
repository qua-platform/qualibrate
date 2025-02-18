from collections.abc import Generator
from pathlib import Path

import pytest
import tomli_w
from pydantic import Field
from qualibrate_config.models import QualibrateConfig

from qualibrate import NodeParameters, QualibrationNode


@pytest.fixture
def qualibrate_config(
    mocker, tmp_path: Path
) -> Generator[QualibrateConfig, None, None]:
    log_folder = tmp_path / "log_folder"
    log_folder.mkdir()
    storage_folder = tmp_path / "storage_folder"
    storage_folder.mkdir()
    config = QualibrateConfig(
        {"log_folder": log_folder, "storage": {"location": storage_folder}}
    )
    mocker.patch(
        "qualibrate.utils.logger_m.get_qualibrate_config", return_value=config
    )
    yield config


@pytest.fixture
def qualibrate_config_path(mocker, tmp_path):
    conf_path = tmp_path / "config.toml"
    mocker.patch(
        "qualibrate.utils.logger_m.get_qualibrate_config_path",
        return_value=conf_path,
    )
    yield conf_path


@pytest.fixture(autouse=True)
def qualibrate_config_from_path(qualibrate_config_path, qualibrate_config):
    with qualibrate_config_path.open("wb") as f:
        tomli_w.dump(qualibrate_config.serialize(), f)
    yield qualibrate_config


@pytest.fixture
def node():
    class Parameters(NodeParameters):
        qubits: list[str] = Field(default_factory=list)

        str_value: str = "test"
        int_value: int = 1
        float_value: float = 1.0

    node = QualibrationNode("test_node", parameters=Parameters())
    return node


@pytest.fixture(scope="function", autouse=True)
def remove_quam_root():
    from quam.core import QuamBase

    QuamBase._last_instantiated_root = None


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
