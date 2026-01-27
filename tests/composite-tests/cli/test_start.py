"""Tests for the start command and demo setup functionality."""

import os
import shutil
import tempfile
from pathlib import Path
from unittest.mock import MagicMock, patch

import pytest
from click.testing import CliRunner

from qualibrate.composite.cli.start import _setup_demo_on_first_run, start_command


@pytest.fixture(autouse=True)
def cleanup_env_vars():
    """Clean up QUALIBRATE_CONFIG_FILE env var after each test to prevent pollution."""
    yield
    # Cleanup after test
    if "QUALIBRATE_CONFIG_FILE" in os.environ:
        del os.environ["QUALIBRATE_CONFIG_FILE"]


@pytest.fixture
def temp_qualibrate_dir():
    """Create a temporary directory to use as the qualibrate config directory."""
    with tempfile.TemporaryDirectory() as tmpdir:
        yield Path(tmpdir)


@pytest.fixture
def temp_config_path(temp_qualibrate_dir):
    """Return a temporary config path."""
    return temp_qualibrate_dir / "config.toml"


@pytest.fixture
def mock_qualibrate_examples(tmp_path):
    """Create a mock qualibrate_examples package structure."""
    examples_dir = tmp_path / "qualibrate_examples"
    examples_dir.mkdir()

    # Create calibrations directory with dummy files
    calibrations_dir = examples_dir / "calibrations"
    calibrations_dir.mkdir()
    (calibrations_dir / "01_demo_qubit_spectroscopy.py").write_text("# Demo calibration 1")
    (calibrations_dir / "02_demo_rabi.py").write_text("# Demo calibration 2")

    # Create demo_quam_state directory with dummy files
    demo_state_dir = examples_dir / "demo_quam_state"
    demo_state_dir.mkdir()
    (demo_state_dir / "state.json").write_text('{"dummy": "state"}')
    (demo_state_dir / "qua_config.json").write_text('{"dummy": "config"}')

    # Set __file__ attribute to make Path(qualibrate_examples.__file__).parent work
    examples_dir / "__init__.py"
    (examples_dir / "__init__.py").write_text("")

    return examples_dir


class TestSetupDemoOnFirstRun:
    """Test the _setup_demo_on_first_run helper function."""

    def test_demo_calibrations_are_copied(self, temp_config_path, mock_qualibrate_examples):
        """Test that demo calibrations are copied to the correct location."""
        mock_module = MagicMock()
        mock_module.__file__ = str(mock_qualibrate_examples / "__init__.py")

        # Patch sys.modules to make the import work
        with patch.dict(
            "sys.modules",
            {"qualibrate_examples": mock_module},
        ):
            _setup_demo_on_first_run(temp_config_path)

        # Check that demo_calibrations directory was created
        demo_calibrations_dest = temp_config_path.parent / "demo_calibrations"
        assert demo_calibrations_dest.exists()
        assert (demo_calibrations_dest / "01_demo_qubit_spectroscopy.py").exists()
        assert (demo_calibrations_dest / "02_demo_rabi.py").exists()

    def test_demo_state_is_copied(self, temp_config_path, mock_qualibrate_examples):
        """Test that demo state files are copied to the correct location."""
        mock_module = MagicMock()
        mock_module.__file__ = str(mock_qualibrate_examples / "__init__.py")

        # Mock both qualibrate_examples and quam packages
        with patch.dict(
            "sys.modules",
            {
                "qualibrate_examples": mock_module,
                "quam": MagicMock(),
            },
        ):
            _setup_demo_on_first_run(temp_config_path)

        # Check that demo_quam_state directory was created
        demo_state_dest = temp_config_path.parent / "demo_quam_state"
        assert demo_state_dest.exists()
        assert (demo_state_dest / "state.json").exists()
        assert (demo_state_dest / "qua_config.json").exists()

    def test_demo_project_config_is_created(self, temp_config_path, mock_qualibrate_examples):
        """Test that demo_project config is created with correct overrides."""
        mock_module = MagicMock()
        mock_module.__file__ = str(mock_qualibrate_examples / "__init__.py")

        with patch.dict(
            "sys.modules",
            {"qualibrate_examples": mock_module},
        ):
            _setup_demo_on_first_run(temp_config_path)

        # Check that demo_project config was created
        demo_project_config = temp_config_path.parent / "projects" / "demo_project" / "config.toml"
        assert demo_project_config.exists()

        # Verify config content
        config_content = demo_project_config.read_text()
        assert "calibration_library" in config_content
        assert "demo_calibrations" in config_content

    def test_setup_is_idempotent(self, temp_config_path, mock_qualibrate_examples):
        """Test that running setup twice doesn't cause errors."""
        mock_module = MagicMock()
        mock_module.__file__ = str(mock_qualibrate_examples / "__init__.py")

        with patch.dict(
            "sys.modules",
            {"qualibrate_examples": mock_module},
        ):
            # Run setup twice
            _setup_demo_on_first_run(temp_config_path)
            _setup_demo_on_first_run(temp_config_path)

        # Verify everything still exists and is correct
        demo_calibrations_dest = temp_config_path.parent / "demo_calibrations"
        assert demo_calibrations_dest.exists()

        demo_project_config = temp_config_path.parent / "projects" / "demo_project" / "config.toml"
        assert demo_project_config.exists()

    def test_handles_missing_qualibrate_examples_package(self, temp_config_path):
        """Test graceful handling when qualibrate_examples is not available."""
        with patch(
            "qualibrate.composite.cli.start.importlib.import_module",
            side_effect=ImportError("qualibrate_examples not found"),
        ):
            # Should not raise an error
            _setup_demo_on_first_run(temp_config_path)

    def test_handles_missing_calibrations_directory(self, temp_config_path, mock_qualibrate_examples):
        """Test graceful handling when calibrations directory doesn't exist."""
        # Remove calibrations directory
        calibrations_dir = mock_qualibrate_examples / "calibrations"
        shutil.rmtree(calibrations_dir)

        mock_module = MagicMock()
        mock_module.__file__ = str(mock_qualibrate_examples / "__init__.py")

        with patch.dict(
            "sys.modules",
            {"qualibrate_examples": mock_module},
        ):
            # Should not raise an error
            _setup_demo_on_first_run(temp_config_path)

    def test_handles_permission_errors_gracefully(self, temp_config_path, mock_qualibrate_examples):
        """Test graceful handling of permission errors during file operations."""
        mock_module = MagicMock()
        mock_module.__file__ = str(mock_qualibrate_examples / "__init__.py")

        with (
            patch(
                "qualibrate.composite.cli.start.shutil.copytree",
                side_effect=PermissionError("Access denied"),
            ),
            patch.dict(
                "sys.modules",
                {"qualibrate_examples": mock_module},
            ),
        ):
            # Should not raise an error
            _setup_demo_on_first_run(temp_config_path)


class TestFirstRunDetection:
    """Test first-run detection logic in start_command."""

    def test_first_run_condition_true_when_config_missing(self, temp_config_path):
        """Test that is_first_run is True when config doesn't exist."""
        # Config path doesn't exist
        assert not temp_config_path.exists()

        # Mock config_vars.DEFAULT_CONFIG_FILEPATH to match our temp path
        with (
            patch(
                "qualibrate.composite.cli.start.config_vars.DEFAULT_CONFIG_FILEPATH",
                temp_config_path,
            ),
            patch("qualibrate.composite.cli.start.config_command") as mock_config_cmd,
        ):

            def create_config(*args, **kwargs):
                """Side effect to create config file."""
                temp_config_path.parent.mkdir(parents=True, exist_ok=True)
                temp_config_path.write_text("[qualibrate]\nversion = 5\n")

            mock_config_cmd.side_effect = create_config

            with (
                patch(
                    "qualibrate.composite.cli.start._projects_folder_exist",
                    return_value=False,
                ),
                patch("qualibrate.composite.cli.start._setup_demo_on_first_run") as mock_demo_setup,
            ):
                # Patch the app loading to prevent actual import
                with patch.dict(
                    "sys.modules",
                    {"qualibrate.composite.app": MagicMock()},
                ):
                    runner = CliRunner()
                    # Use mix_stderr=False to see errors more clearly
                    # result
                    _ = runner.invoke(
                        start_command,
                        ["--config-path", str(temp_config_path)],
                        catch_exceptions=False,
                    )

                # Demo setup should have been called for first run
                mock_demo_setup.assert_called_once()

    def test_first_run_condition_false_when_config_exists(self, temp_config_path):
        """Test that is_first_run is False when config already exists."""
        # Pre-create config file
        temp_config_path.parent.mkdir(parents=True, exist_ok=True)
        temp_config_path.write_text("[qualibrate]\nversion = 5\n")

        with (
            patch(
                "qualibrate.composite.cli.start.config_vars.DEFAULT_CONFIG_FILEPATH",
                temp_config_path,
            ),
            patch("qualibrate.composite.cli.start.config_command") as mock_config_cmd,
        ):
            with (
                patch("qualibrate.composite.cli.start._setup_demo_on_first_run") as mock_demo_setup,
                patch("qualibrate.composite.cli.start._projects_folder_exist", return_value=True),
                patch.dict(
                    "sys.modules",
                    {"qualibrate.composite.app": MagicMock()},
                ),
            ):
                runner = CliRunner()
                # result
                _ = runner.invoke(
                    start_command,
                    ["--config-path", str(temp_config_path)],
                    catch_exceptions=False,
                )

            # Demo setup should NOT have been called
            mock_demo_setup.assert_not_called()
            # Config command should NOT have been called either
            mock_config_cmd.assert_not_called()
