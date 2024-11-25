from datetime import datetime
from pathlib import Path
from unittest.mock import MagicMock, PropertyMock

import pytest
from pydantic import Field

from qualibrate import QualibrationNode
from qualibrate.models.outcome import Outcome
from qualibrate.models.run_mode import RunModes
from qualibrate.models.run_summary.run_error import RunError
from qualibrate.q_runnnable import QRunnable
from qualibrate.qualibration_node import NodeCreateParametersType
from qualibrate.utils.exceptions import StopInspection


class TestQualibrationNode:
    @pytest.fixture
    def mock_logger(self, mocker):
        return mocker.patch("qualibrate.qualibration_node.logger")

    @pytest.fixture
    def mock_last_executed_node_ctx(self, mocker):
        return mocker.patch(
            "qualibrate.qualibration_node.last_executed_node_ctx"
        )

    @pytest.fixture
    def mock_external_parameters_ctx(self, mocker):
        return mocker.patch(
            "qualibrate.qualibration_node.external_parameters_ctx"
        )

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
        mock_last_executed_node_ctx,
        mock_external_parameters_ctx,
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

        # Mock external_parameters_ctx.get()
        mock_external_parameters_ctx.get.return_value = None

        # Create an instance
        node = QualibrationNode(name="test_node")

        # Assertions
        mock_logger.info.assert_called_with("Creating node test_node")
        mock_validate.assert_called_with("test_node", None, None)
        mock_super_init.assert_called_once()
        assert node.results == {}
        assert node.machine is None
        mock_warn_if_external.assert_called_once()
        mock_last_executed_node_ctx.set.assert_called_with(node)

    def test_init_with_inspection_mode(
        self,
        mocker,
        mock_logger,
        mock_external_parameters_ctx,
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

        # Mock external_parameters_ctx.get()
        mock_external_parameters_ctx.get.return_value = None

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

    def test__validate_passed_parameters_options_with_parameters(self):
        parameters = MagicMock()
        # Call the method
        result = QualibrationNode._validate_passed_parameters_options(
            name="test_node", parameters=parameters, parameters_class=None
        )
        # Should return the passed parameters
        assert result == parameters

    def test__validate_passed_parameters_options_with_parameters_class(
        self, mock_logger
    ):
        parameters_class = MagicMock(return_value="parameters_instance")
        # Call the method
        result = QualibrationNode._validate_passed_parameters_options(
            name="test_node", parameters=None, parameters_class=parameters_class
        )
        # Should return instance of parameters_class
        parameters_class.assert_called_once()
        assert result == "parameters_instance"
        mock_logger.warning.assert_called_once_with(
            "parameters_class argument is deprecated. Please use "
            "parameters argument for initializing node 'test_node'."
        )

    def test__validate_passed_parameters_options_with_both_parameters_and_class(
        self, mock_logger
    ):
        parameters = MagicMock()
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
        parameters_class = MagicMock(
            side_effect=ValueError("Instantiation failed")
        )

        with pytest.raises(ValueError, match="Instantiation failed"):
            QualibrationNode._validate_passed_parameters_options(
                name="test_node",
                parameters=None,
                parameters_class=parameters_class,
            )
        mock_logger.warning.assert_called_once()

    def test__warn_if_external_and_interactive_mpl(
        self, mock_logger, mock_matplotlib
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
        self, mock_logger, mock_matplotlib
    ):
        mock_matplotlib.get_backend.return_value = "agg"
        node = QualibrationNode(name="test_node")
        node.modes = MagicMock(external=True)

        node._warn_if_external_and_interactive_mpl()

        mock_matplotlib.use.assert_not_called()
        mock_logger.warning.assert_not_called()

    def test_snapshot_idx_with_storage_manager(self):
        node = QualibrationNode(name="test_node")
        node.storage_manager = MagicMock(snapshot_idx=42)
        assert node.snapshot_idx == 42

    def test_snapshot_idx_without_storage_manager(self):
        node = QualibrationNode(name="test_node")
        node.storage_manager = None
        assert node.snapshot_idx is None

    def test_save_with_storage_manager(self):
        node = QualibrationNode(name="test_node")
        node.storage_manager = MagicMock()
        node.save()
        node.storage_manager.save.assert_called_with(node=node)

    def test_save_without_storage_manager_no_qualibrate_app(
        self, mocker, mock_logger
    ):
        node = QualibrationNode(name="test_node")
        node.storage_manager = None

        # Mock find_spec to return None
        mocker.patch(
            "qualibrate.qualibration_node.find_spec", return_value=None
        )
        mocker.patch(
            "qualibrate.qualibration_node.get_qualibrate_app_settings",
            return_value=None,
        )

        node.save()

        mock_logger.warning.assert_any_call(
            "Node.storage_manager should be defined to save node, "
            "resorting to default configuration"
        )

    def test__post_run(self, mocker):
        class P(NodeCreateParametersType):
            qubits: list[str] = Field(
                default_factory=lambda: ["target1", "target2", "target3"]
            )

        node = QualibrationNode(name="test_node")
        last_executed_node = MagicMock()
        created_at = datetime.now()
        initial_targets = ["target1", "target2"]
        run_error = None
        parameters = P()

        last_executed_node.outcomes = {"target1": "successful"}
        mocker.patch.object(
            node.__class__, "parameters", PropertyMock(return_value=parameters)
        )

        run_summary = node._post_run(
            last_executed_node,
            created_at,
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
        mock_external_parameters_ctx,
        mock_last_executed_node_ctx,
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

        # Mock get
        last_executed_node = MagicMock()
        mock_last_executed_node_ctx.get.return_value = last_executed_node

        # Call run
        result_node, run_summary = node.run()

        # Assertions
        mock_run_node_file.assert_called_with(node.filepath)
        mock_post_run.assert_called()
        assert result_node == last_executed_node
        assert run_summary == "run_summary"

    def test_run_no_filepath(self, mocker):
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
        mock_external_parameters_ctx,
        mock_last_executed_node_ctx,
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
        run_error = mock_post_run.call_args[0][4]
        assert isinstance(run_error, RunError)
        mock_logger.exception.assert_called()

    def test_run_node_file(self, mocker, mock_matplotlib):
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

    def test_stop_no_qm(self, mocker):
        node = QualibrationNode(name="test_node")
        node.machine = None

        # Mock find_spec to return None
        mocker.patch(
            "qualibrate.qualibration_node.find_spec", return_value=None
        )

        result = node.stop()

        assert result is False

    def test_stop_with_qm(self, mocker):
        node = QualibrationNode(name="test_node")
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
