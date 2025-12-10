from collections.abc import Generator
from pathlib import Path
from unittest.mock import Mock

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
def qualibrate_config_and_path_mocked(mocker, qualibrate_config_from_path):
    mocker.patch("qualibrate.qualibration_node.get_qualibrate_config_path")
    mocker.patch(
        "qualibrate.qualibration_node.get_qualibrate_config",
        return_value=qualibrate_config_from_path,
    )


@pytest.fixture
def node(qualibrate_config_and_path_mocked):
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
    from quam.components import BasicQuam, SingleChannel

    machine = BasicQuam(
        channels={
            "ch1": SingleChannel(
                opx_output=("con1", 1), intermediate_frequency=100e6
            )
        },
    )
    return machine


@pytest.fixture
def simple_action_function():
    """Provide a simple function that can be wrapped as an action."""

    def action_func(node):
        """Simple action that returns a dict."""
        return {"result": "success", "value": 42}

    return action_func


@pytest.fixture
def action_with_no_return():
    """Provide an action function that returns None."""

    def action_func(node):
        """Action with no return value."""
        node.results = {"computed": True}
        # No return statement

    return action_func


@pytest.fixture
def action_with_non_dict_return():
    """Provide an action function that returns a non-dict value."""

    def action_func(node):
        """Action that returns a non-dict value."""
        return "just a string"

    return action_func


@pytest.fixture
def action_that_raises():
    """Provide an action function that raises an exception."""

    def action_func(node):
        """Action that raises an error."""
        raise ValueError("Test error from action")

    return action_func


@pytest.fixture
def non_interactive_mode(mocker):
    """Mock is_interactive to return False (non-interactive mode)."""
    mocker.patch(
        "qualibrate.runnables.run_action.action.is_interactive",
        return_value=False,
    )
    yield


@pytest.fixture
def mock_action_manager():
    """Provide a mock ActionManager."""
    manager = Mock()
    manager.current_action = None
    manager.predefined_names = set()
    manager.actions = {}
    return manager


@pytest.fixture
def mock_node():
    """Provide a mock QualibrationNode."""
    node = Mock()
    node.namespace = {}
    node.action_label = None
    return node
