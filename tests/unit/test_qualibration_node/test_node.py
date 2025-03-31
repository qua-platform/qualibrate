from datetime import datetime
from pathlib import Path
from unittest.mock import MagicMock, PropertyMock

import pytest
from pydantic import Field

from qualibrate import NodeParameters, QualibrationNode
from qualibrate.models.outcome import Outcome
from qualibrate.models.run_mode import RunModes
from qualibrate.models.run_summary.run_error import RunError
from qualibrate.q_runnnable import QRunnable
from qualibrate.qualibration_node import NodeCreateParametersType
from qualibrate.storage.local_storage_manager import LocalStorageManager
from qualibrate.utils.exceptions import StopInspection


class TestQualibrationNode:
    @pytest.fixture
    def mock_logger(self, mocker):
        return mocker.patch("qualibrate.qualibration_node.logger")

    @pytest.fixture
    def mock_run_modes_ctx(self, mocker):
        return mocker.patch("qualibrate.qualibration_node.run_modes_ctx")

    @pytest.fixture
    def mock_matplotlib(self, mocker):
        return mocker.patch("qualibrate.qualibration_node.matplotlib")

    def test_init_without_parameters(
        self,
        mocker,
        mock_logger,
        qualibrate_config_and_path_mocked,
    ):
        # Mock the _validate_passed_parameters_options method
        mock_validate = mocker.patch.object(
            QualibrationNode,
            "_validate_passed_parameters_options",
            return_value=MagicMock(),
        )

        # Mock the superclass __init__
        mock_super_init = mocker.patch.object(
            QRunnable, "__init__", return_value=None
        )

        # Mock _warn_if_external_and_interactive_mpl
        mock_warn_if_external = mocker.patch.object(
            QualibrationNode,
            "_warn_if_external_and_interactive_mpl",
            return_value=None,
        )

        # Create an instance
        node = QualibrationNode(name="test_node")

        # Assertions
        mock_logger.info.assert_called_with("Creating node test_node")
        mock_validate.assert_called_with("test_node", None, None)
        mock_super_init.assert_called_once()
        assert node.results == {}
        assert node.machine is None
        mock_warn_if_external.assert_called_once()

    def test_init_with_inspection_mode(
        self,
        mocker,
        mock_logger,
        mock_matplotlib,
    ):
        # Mock the _validate_passed_parameters_options method
        mock_validate = mocker.patch.object(
            QualibrationNode,
            "_validate_passed_parameters_options",
            return_value=MagicMock(),
        )
        mocker.patch.object(QRunnable, "build_parameters_class_from_instance")

        # Mock _warn_if_external_and_interactive_mpl
        mock_warn_if_external = mocker.patch.object(
            QualibrationNode,
            "_warn_if_external_and_interactive_mpl",
            return_value=None,
        )

        # Create an instance with inspection mode
        modes = RunModes(inspection=True)
        with pytest.raises(
            StopInspection, match="Node instantiated in inspection mode"
        ) as ex:
            QualibrationNode(name="test_node", modes=modes)

        assert isinstance(ex.value.instance, QualibrationNode)
        assert ex.value.instance.name == "test_node"
        mock_logger.info.assert_called_with("Creating node test_node")
        mock_validate.assert_called_with("test_node", None, None)
        mock_warn_if_external.assert_not_called()

    def test__validate_passed_parameters_options_with_invalid_parameters_type(
        self,
    ):
        parameters = MagicMock()
        # Call the method
        with pytest.raises(ValueError):
            QualibrationNode._validate_passed_parameters_options(
                name="test_node", parameters=parameters, parameters_class=None
            )

    def test__validate_passed_parameters_options_with_parameters(self):
        parameters = MagicMock(spec=NodeParameters)
        # Call the method
        result = QualibrationNode._validate_passed_parameters_options(
            name="test_node", parameters=parameters, parameters_class=None
        )
        # Should return the passed parameters
        assert result == parameters

    def test__validate_passed_parameters_options_with_invalid_parameters_class(
        self, mock_logger
    ):
        class Parameters:
            pass

        with pytest.raises(ValueError):
            QualibrationNode._validate_passed_parameters_options(
                name="test_node", parameters=None, parameters_class=Parameters
            )

    def test__validate_passed_parameters_options_with_parameters_class(
        self, mock_logger
    ):
        class Parameters(NodeParameters):
            val: int = 1

        # Call the method
        result = QualibrationNode._validate_passed_parameters_options(
            name="test_node", parameters=None, parameters_class=Parameters
        )
        # Should return instance of parameters_class

        assert isinstance(result, Parameters)
        assert result.val == 1
        mock_logger.warning.assert_called_once_with(
            "parameters_class argument is deprecated. Please use "
            "parameters argument for initializing node 'test_node'."
        )

    def test__validate_passed_parameters_options_with_both_parameters_and_class(
        self, mock_logger
    ):
        parameters = MagicMock(spec=NodeParameters)
        parameters_class = MagicMock()

        # Call the method
        result = QualibrationNode._validate_passed_parameters_options(
            name="test_node",
            parameters=parameters,
            parameters_class=parameters_class,
        )
        assert result == parameters
        mock_logger.warning.assert_called_once_with(
            "Passed both parameters and parameters_class to the node "
            "'test_node'. Please use only parameters argument"
        )

    def test__validate_passed_parameters_options_with_none(self, mocker):
        mocked_create_model = mocker.patch(
            "qualibrate.qualibration_node.create_model"
        )
        params = mocker.patch(
            "qualibrate.qualibration_node.NodeParameters",
            __name__="a",
            __doc__="str",
            __module__="module",
        )
        QualibrationNode._validate_passed_parameters_options(
            name="test_node", parameters=None, parameters_class=None
        )
        mocked_create_model.assert_called_once_with(
            "a", __doc__="str", __base__=params, __module__="module"
        )

    def test__validate_passed_parameters_options_parameters_class_instantiation_failure(  # noqa: E501
        self, mock_logger
    ):
        class Parameters(NodeParameters):
            val_int: int = Field(default="a", validate_default=True)

        node_name = "test_node"
        with pytest.raises(
            ValueError,
            match=f"Can't instantiate parameters class of node '{node_name}'",
        ):
            QualibrationNode._validate_passed_parameters_options(
                name=node_name,
                parameters=None,
                parameters_class=Parameters,
            )
        mock_logger.warning.assert_called_once()

    def test__warn_if_external_and_interactive_mpl(
        self,
        mock_logger,
        mock_matplotlib,
        qualibrate_config_and_path_mocked,
    ):
        mock_matplotlib.get_backend.return_value = "tkagg"
        node = QualibrationNode(name="test_node")
        node.modes = MagicMock(external=True)

        node._warn_if_external_and_interactive_mpl()
        mock_matplotlib.use.assert_called_with("agg")
        mock_logger.warning.assert_called_with(
            "Using interactive matplotlib backend 'tkagg' in "
            "external mode. The backend is changed to 'agg'."
        )

    def test__warn_if_external_and_interactive_mpl_non_interactive(
        self,
        mock_logger,
        mock_matplotlib,
        qualibrate_config_and_path_mocked,
    ):
        mock_matplotlib.get_backend.return_value = "agg"
        node = QualibrationNode(name="test_node")
        node.modes = MagicMock(external=True)

        node._warn_if_external_and_interactive_mpl()

        mock_matplotlib.use.assert_not_called()
        mock_logger.warning.assert_not_called()

    def test_snapshot_idx_with_storage_manager(
        self,
        qualibrate_config_and_path_mocked,
    ):
        node = QualibrationNode(name="test_node")
        node.storage_manager = MagicMock(snapshot_idx=42)
        assert node.snapshot_idx == 42

    def test_snapshot_idx_without_storage_manager(
        self,
        qualibrate_config_and_path_mocked,
    ):
        node = QualibrationNode(name="test_node")
        node.storage_manager = None
        assert node.snapshot_idx is None

    def test_save_with_storage_manager(
        self, mocker, qualibrate_config_and_path_mocked
    ):
        node = QualibrationNode(name="test_node")
        manager = MagicMock(spec=LocalStorageManager)
        mocker.patch.object(node, "_get_storage_manager", return_value=manager)
        node.save()
        manager.save.assert_called_with(node=node)

    def test__post_run(
        self,
        mocker,
        qualibrate_config_and_path_mocked,
    ):
        class P(NodeCreateParametersType):
            qubits: list[str] = Field(
                default_factory=lambda: ["target1", "target2", "target3"]
            )

        node = QualibrationNode(name="test_node")
        last_executed_node = MagicMock()
        created_at = datetime.now().astimezone()
        initial_targets = ["target1", "target2"]
        run_error = None
        parameters = P()

        last_executed_node.outcomes = {"target1": "successful"}
        mocker.patch.object(
            node.__class__, "parameters", PropertyMock(return_value=parameters)
        )
        node.run_start = created_at

        run_summary = node._post_run(
            initial_targets,
            parameters,
            run_error,
        )

        assert node.outcomes == {
            "target1": Outcome.SUCCESSFUL,
            "target2": Outcome.SUCCESSFUL,
            "target3": Outcome.SUCCESSFUL,
        }
        assert node.run_summary == run_summary
        assert set(run_summary.successful_targets) == {
            "target1",
            "target2",
            "target3",
        }
        assert run_summary.failed_targets == []

    def test_run_successful(
        self,
        mocker,
        mock_run_modes_ctx,
        qualibrate_config_and_path_mocked,
    ):
        class P(NodeCreateParametersType):
            qubits: list[str] = Field(
                default_factory=lambda: ["target1", "target2"]
            )

        node = QualibrationNode(name="test_node")
        node.filepath = Path("test_path")
        mocker.patch.object(
            node.__class__, "parameters", PropertyMock(return_value=P())
        )

        # Mock datetime
        mock_datetime = mocker.patch("qualibrate.qualibration_node.datetime")
        mock_datetime.now.return_value = datetime(2020, 1, 1)

        # Mock run_node_file
        mock_run_node_file = mocker.patch.object(node, "run_node_file")

        # Mock _post_run
        mock_post_run = mocker.patch.object(
            node, "_post_run", return_value="run_summary"
        )

        # Call run
        run_summary = node.run()

        # Assertions
        mock_run_node_file.assert_called_with(node.filepath)
        mock_post_run.assert_called()
        assert run_summary == "run_summary"

    def test_run_no_filepath(
        self,
        qualibrate_config_and_path_mocked,
    ):
        node = QualibrationNode(name="test_node")
        node.filepath = None

        with pytest.raises(
            RuntimeError, match="Node test_node file path was not provided"
        ):
            node.run()

    def test_run_exception(
        self,
        mocker,
        mock_logger,
        mock_run_modes_ctx,
        qualibrate_config_and_path_mocked,
    ):
        class P(NodeCreateParametersType):
            qubits: list[str] = Field(
                default_factory=lambda: ["target1", "target2"]
            )

        node = QualibrationNode(name="test_node")
        node.filepath = Path("test_path")
        mocker.patch.object(
            node.__class__, "parameters", PropertyMock(return_value=P())
        )

        # Mock datetime
        mock_datetime = mocker.patch("qualibrate.qualibration_node.datetime")
        mock_datetime.now.return_value = datetime(2020, 1, 1)

        # Mock run_node_file to raise exception
        mocker.patch.object(
            node, "run_node_file", side_effect=Exception("Test error")
        )

        # Mock _post_run
        mock_post_run = mocker.patch.object(
            node, "_post_run", return_value="run_summary"
        )

        # Call run and expect exception
        with pytest.raises(Exception, match="Test error"):
            node.run()

        # Assertions
        mock_post_run.assert_called()
        run_error = mock_post_run.call_args[0][2]
        assert isinstance(run_error, RunError)
        mock_logger.exception.assert_called()

    def test_run_node_file(
        self,
        mocker,
        mock_matplotlib,
        qualibrate_config_and_path_mocked,
    ):
        node = QualibrationNode(name="test_node")
        node_filepath = Path("test_node.py")
        mock_import_from_path = mocker.patch(
            "qualibrate.qualibration_node.import_from_path"
        )
        mock_matplotlib.get_backend.return_value = "tkagg"

        node.run_node_file(node_filepath)

        mock_matplotlib.use.assert_any_call("agg")
        mock_matplotlib.use.assert_any_call("tkagg")
        mock_import_from_path.assert_called_with(
            "_node_test_node", node_filepath
        )

    @pytest.fixture
    def node_active_node_self(self, mocker):
        mocker.patch(
            "qualibrate.qualibration_node.QualibrationNode._get_storage_manager"
        )
        node = QualibrationNode(name="test_node")
        node.__class__.active_node = node
        yield node
        node.__class__.active_node = None

    def test_stop_no_qm(
        self,
        mocker,
        node_active_node_self,
        qualibrate_config_and_path_mocked,
    ):
        node = node_active_node_self
        node.machine = None

        # Mock find_spec to return None
        mocker.patch(
            "qualibrate.qualibration_node.find_spec", return_value=None
        )

        result = node.stop()

        assert result is False

    def test_stop_with_qm(
        self,
        mocker,
        node_active_node_self,
        qualibrate_config_and_path_mocked,
    ):
        node = node_active_node_self
        node.machine = MagicMock()
        node.machine.connect.return_value = MagicMock(
            list_open_quantum_machines=lambda: [1],
            get_qm=lambda x: MagicMock(
                get_running_job=lambda: MagicMock(halt=lambda: None)
            ),
        )

        # Mock find_spec to return something
        mocker.patch(
            "qualibrate.qualibration_node.find_spec", return_value=MagicMock()
        )

        result = node.stop()

        assert result is True

    def test_record_state_updates(self, node, machine):
        channel = machine.channels["ch1"]
        assert channel.intermediate_frequency == 100e6

        with node.record_state_updates(interactive_only=False):
            channel.intermediate_frequency = 50e6

        assert channel.intermediate_frequency == 100e6
        assert node.state_updates == {
            "#/channels/ch1/intermediate_frequency": {
                "key": "#/channels/ch1/intermediate_frequency",
                "attr": "intermediate_frequency",
                "new": 50e6,
                "old": 100e6,
            }
        }

    def test_scan_folder_for_instances(self, mocker, mock_run_modes_ctx):
        mock_run_modes_ctx.get.return_value = None
        # Mock path.iterdir()
        mock_path = MagicMock()
        mock_path.iterdir.return_value = [Path("node1.py"), Path("node2.py")]
        mocker.patch(
            "qualibrate.qualibration_node.file_is_calibration_instance",
            return_value=True,
        )
        mock_scan_node_file = mocker.patch.object(
            QualibrationNode, "scan_node_file"
        )

        QualibrationNode.scan_folder_for_instances(mock_path)

        mock_run_modes_ctx.set.assert_called()
        mock_scan_node_file.assert_any_call(Path("node1.py"), {})
        mock_scan_node_file.assert_any_call(Path("node2.py"), {})

    def test_scan_node_file(self, mocker):
        file = Path("node.py")
        nodes = {}
        mock_import_from_path = mocker.patch(
            "qualibrate.qualibration_node.import_from_path",
            side_effect=StopInspection(instance=MagicMock()),
        )

        QualibrationNode.scan_node_file(file, nodes)

        mock_import_from_path.assert_called_with("_node_node", file)

    def test_add_node(self):
        node = MagicMock()
        node.name = "test_node"
        nodes = {}

        # Call the method
        QualibrationNode.add_node(node, nodes)

        # Assertions
        assert nodes["test_node"] == node

    def test_add_node_duplicate(self, mocker, mock_logger):
        node = MagicMock()
        node.name = "test_node"
        nodes = {"test_node": MagicMock()}

        # Call the method
        QualibrationNode.add_node(node, nodes)

        # Assertions
        mock_logger.warning.assert_called_with(
            'Node "test_node" already exists in library, overwriting'
        )
        assert nodes["test_node"] == node
