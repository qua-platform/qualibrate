import importlib
import os
import shutil
from pathlib import Path

import click
from qualibrate_config import vars as config_vars
from qualibrate_config.cli import config_command

from qualibrate.composite.config import vars as composite_vars


def _projects_folder_exist() -> bool:
    """Check if there are any existing projects."""
    qualibrate_path = config_vars.QUALIBRATE_PATH
    projects_path = qualibrate_path / "projects"
    return projects_path.exists() and any(projects_path.iterdir())


def _setup_demo_on_first_run(config_path: Path) -> None:
    """Set up demo calibrations and demo project on first-time startup.

    This function runs only when QUAlibrate is started for the first time
    (when no config exists). It copies demo calibrations and state files
    from the installed qualibrate_examples package to user directories
    and configures the demo_project to use these calibrations.

    Args:
        config_path: Path to the config file (used to determine qualibrate_path)
    """
    qualibrate_path = config_path.parent
    projects_path = qualibrate_path / "projects"

    # Check if there are any existing projects
    if projects_path.exists() and any(projects_path.iterdir()):
        click.echo("Existing projects found. Skipping demo project setup.")
        return

    demo_calibrations_dest = qualibrate_path / "demo_calibrations"
    demo_project_config_path = projects_path / "demo_project" / "config.toml"

    try:
        # Import qualibrate_examples to locate demo files
        import qualibrate_examples

        examples_path = Path(qualibrate_examples.__file__).parent
        calibrations_src = examples_path / "calibrations"

        # Copy demo calibrations if they don't already exist
        if not demo_calibrations_dest.exists():
            if calibrations_src.exists():
                shutil.copytree(calibrations_src, demo_calibrations_dest)
                click.echo(f"Copied demo calibrations to {demo_calibrations_dest}")
            else:
                click.echo(
                    f"Warning: Demo calibrations not found at {calibrations_src}"
                )

        # Create or update demo_project config with calibration_library override
        demo_project_config_path.parent.mkdir(parents=True, exist_ok=True)

        # Write the demo_project config with overrides
        demo_config_content = f"""[qualibrate.calibration_library]
folder = "{demo_calibrations_dest}"
"""
        try:
            import quam

            demo_state_dest = qualibrate_path / "demo_quam_state"
            demo_state_src = examples_path / "demo_quam_state"
            # Copy demo state files if they don't already exist
            if not demo_state_dest.exists():
                if demo_state_src.exists():
                    shutil.copytree(demo_state_src, demo_state_dest)
                    click.echo(f"Copied demo state to {demo_state_dest}")
                else:
                    click.echo(f"Warning: Demo state not found at {demo_state_src}")

            demo_config_content += f"""
[quam]
state_path = "{demo_state_dest}"
"""
        except ImportError:
            click.echo(
                "Warning: quam package not found. Skipping demo quam state setup."
            )

        demo_project_config_path.write_text(demo_config_content)
        click.echo(f"Created demo project config at {demo_project_config_path}")

    except ImportError:
        click.echo(
            "Warning: qualibrate_examples package not found. Skipping demo setup."
        )
    except Exception as e:
        click.echo(f"Warning: Error during demo setup: {e}")


@click.command(name="start")
@click.option(
    "--config-path",
    type=click.Path(
        file_okay=True,
        dir_okay=True,
        path_type=Path,
    ),
    default=config_vars.QUALIBRATE_PATH / config_vars.DEFAULT_CONFIG_FILENAME,
    help="Path to `config.toml` file",
    show_default=True,
)
@click.option("--reload", is_flag=True, hidden=True)  # env QUALIBRATE_START_RELOAD
@click.option(
    "--port",
    type=int,
    default=8001,
    show_default=True,
    help="Application will be started on the given port",
)  # env QUALIBRATE_START_PORT
@click.option(
    "--host",
    type=str,
    default="127.0.0.1",
    show_default=True,
    help="Application will be started on the given host",
)  # env QUALIBRATE_START_HOST
@click.option(
    "--cors-origin",
    type=str,
    multiple=True,
    help="CORS origin to use. Can be passed multiple times.",
)
@click.option(
    "--root-path",
    type=str,
    default="",
    help=("Optional root path for the application if run as a sub-application."),
)
def start_command(
    config_path: Path,
    port: int,
    host: str,
    reload: bool,
    cors_origin: list[str],
    root_path: str,
) -> None:
    is_first_run = (
        not config_path.exists() and config_path == config_vars.DEFAULT_CONFIG_FILEPATH
    )

    if is_first_run:
        click.echo(f"No config found. Auto-creating config at {config_path}")
        config_command(
            ["--config-path", config_path, "--auto-accept"],
            standalone_mode=False,
        )

    if not _projects_folder_exist():
        click.echo("No projects found. Creating demo project and calibrations.")
        _setup_demo_on_first_run(config_path)

    config_path_str = str(config_path)

    os.environ.setdefault(config_vars.CONFIG_PATH_ENV_NAME, config_path_str)
    os.environ.setdefault(composite_vars.CONFIG_PATH_ENV_NAME, config_path_str)
    os.environ.setdefault(composite_vars.ROOT_PATH_ENV_NAME, root_path)
    if len(cors_origin) != 0:
        os.environ.setdefault(
            composite_vars.CORS_ORIGINS_ENV_NAME, ",".join(cors_origin)
        )

    def _set_module_env_name_and_value(
        module_path: str,
        *,
        attr_to_set: str = "CONFIG_PATH_ENV_NAME",
        env_value_to_set: str,
    ) -> None:
        try:
            module = importlib.import_module(module_path)
        except ModuleNotFoundError:
            return
        if module and (attr_to_set := getattr(module, attr_to_set)):
            os.environ.setdefault(attr_to_set, env_value_to_set)

    _set_module_env_name_and_value(
        "qualibrate.app.config.vars",
        attr_to_set="CONFIG_PATH_ENV_NAME",
        env_value_to_set=config_path_str,
    )
    _set_module_env_name_and_value(
        "qualibrate.runner.config.vars",
        attr_to_set="CONFIG_PATH_ENV_NAME",
        env_value_to_set=config_path_str,
    )
    _set_module_env_name_and_value(
        "quam.config.vars",
        attr_to_set="CONFIG_PATH_ENV_NAME",
        env_value_to_set=config_path_str,
    )

    from qualibrate.composite.app import main as app_main

    app_main(port=port, host=host, reload=reload, root_path=root_path)
