import logging
from collections.abc import Sequence
from pathlib import Path
from typing import Annotated
from urllib.parse import urljoin

import requests
from fastapi import APIRouter, Body, Depends, HTTPException, Query, status
from fastapi import Path as FastAPIPath
from qualibrate_config.models import DatabaseStateConfig, QualibrateConfig, StorageType

from qualibrate.app.api.core.base_models.DBConfigRequest import DBConfigRequest
from qualibrate.app.api.core.base_models.TestConnectionRequest import TestConnectionRequest
from qualibrate.app.api.core.domain.bases.project import ProjectsManagerBase
from qualibrate.app.api.core.domain.local_storage.project import (
    ProjectsManagerLocalStorage,
)
from qualibrate.app.api.core.domain.timeline_db.project import (
    ProjectsManagerTimelineDb,
)
from qualibrate.app.api.core.models.project import Project
from qualibrate.app.api.exceptions.classes.values import QValueException
from qualibrate.app.api.routes.utils import vars as routes_vars
from qualibrate.app.config import (
    get_config_path,
    get_settings,
)
from qualibrate.constants import DEMO_PROJECT_NAME
from qualibrate.core.infrastructure.DB.DBRegistry import DBRegistry

project_router = APIRouter(prefix="/project", tags=["project"])
projects_router = APIRouter(prefix="/projects", tags=["project"])


def _get_projects_manager(
    settings: Annotated[QualibrateConfig, Depends(get_settings)],
    config_path: Annotated[Path, Depends(get_config_path)],
) -> ProjectsManagerBase:
    """
    Resolve and instantiate the concrete projects manager for the storage type.

    Returns:
        A concrete implementation wired to the selected storage backend.
    """
    project_types = {
        StorageType.local_storage: ProjectsManagerLocalStorage,
        StorageType.timeline_db: ProjectsManagerTimelineDb,
    }
    return project_types[settings.storage.type](settings=settings, config_path=config_path)


@project_router.post(
    "/create",
    status_code=status.HTTP_201_CREATED,
    summary="Create a new project",
    response_model=Project,
    responses={
        status.HTTP_201_CREATED: {
            "description": "Project created",
            "content": {
                "application/json": {
                    "examples": {
                        "created_local": {
                            "summary": "Local storage example",
                            "value": "my_project",
                        }
                    }
                }
            },
        }
    },
)
def create_project(
    project_name: Annotated[
        str,
        Query(
            ...,
            description="Name of the project to create.",
            examples=["my_project", "experiment_alpha"],
            min_length=1,
        ),
    ],
    storage_location: Annotated[
        Path | None,
        Body(
            ...,
            description=(
                "Optional root folder for project data, used only when the "
                "storage backend supports a filesystem location."
            ),
            examples=["/data/qualibrate/projects/my_project"],
        ),
    ] = None,
    calibration_library_folder: Annotated[
        Path | None,
        Body(
            ...,
            description="Optional folder containing the calibration library.",
            examples=["/repos/calibration-lib"],
        ),
    ] = None,
    quam_state_path: Annotated[
        Path | None,
        Body(
            ...,
            description=("Optional path to an initial QUAM state JSON to seed the project."),
            examples=["/data/qualibrate/quam_state"],
        ),
    ] = None,
    *,
    projects_manager: Annotated[
        ProjectsManagerBase,
        Depends(_get_projects_manager),
    ],
    database: Annotated[
        DBConfigRequest | None,
        Body(
            description="Optional database configuration for this project.",
            examples=[
                {
                    "isConnected": True,
                    "host": "localhost",
                    "port": 5432,
                    "database": "my_project_db",
                    "username": "postgres",
                    "password": "postgres",
                }
            ],
        ),
    ] = None,
) -> Project:
    """
    Create a project in the configured storage backend. You can optionally set
    a custom storage location, a calibration library folder, a path to a
    QUAM state and a database to save quam state.

    Returns created project name.

    ### Args
    - project_name (str): Name for the new project.
    - storage_location (Path | None): Optional filesystem location for the
    project data if the backend supports it.
    - calibration_library_folder (Path | None): Path to the calibration
    library folder to associate with this project.
    - quam_state_path (Path | None): Path to an initial QUAM state file
    that will be set on project creation.
    - database (DBConfigRequest | None): Optional database configuration for
     saving quam state
    """
    db_config, db_state = None, None
    if database:
        db_config = database.to_db_config()
        db_state = database.to_db_state_config()

    projects_manager.create(
        project_name,
        storage_location=storage_location,
        calibration_library_folder=calibration_library_folder,
        quam_state_path=quam_state_path,
        database=db_config,
        db_state=db_state,
    )
    project = next(filter(lambda p: p.name == project_name, projects_manager.list()), None)
    if project is None:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Project not found",
        )
    return project


@project_router.delete(
    "/delete/{project_name}",
    responses={
        200: {"description": "Project deleted successfully"},
        400: {"description": "Cannot delete active project or project does not exist"},
        403: {"description": "Cannot delete demo project"},
    },
    summary="Delete a project by name",
)
def delete_project_endpoint(
    project_name: Annotated[str, FastAPIPath(..., description="Name of the project to delete")],
    projects_manager: Annotated[ProjectsManagerBase, Depends(_get_projects_manager)],
    config_path: Annotated[Path, Depends(get_config_path)],
    settings: Annotated[QualibrateConfig, Depends(get_settings)],
) -> dict[str, bool]:
    if project_name == DEMO_PROJECT_NAME:
        raise HTTPException(status_code=403, detail="Cannot delete demo project.")

    if projects_manager.project == project_name:
        # Make sure demo exists
        existing = [p.name for p in projects_manager.list()]
        if DEMO_PROJECT_NAME not in existing:
            raise HTTPException(
                status_code=400,
                detail=f"Cannot delete active project because '{DEMO_PROJECT_NAME}' does not exist.",
            )

        old_project = projects_manager.project

        # Switch active project
        projects_manager.project = DEMO_PROJECT_NAME
        routes_vars.ACTIVE_PROJECT_NOT_SET = False

        # Notify runner (reuse your logic)
        def notify_runner(q_settings: QualibrateConfig) -> None:
            if not q_settings.runner:
                return
            settings_update_url = urljoin(
                q_settings.runner.address_with_root,
                "refresh_settings",
            )
            try:
                requests.post(settings_update_url, timeout=5)
            except requests.exceptions.RequestException:
                logging.error(
                    f"Failed to send refresh settings request to {settings_update_url}",
                )

        notify_runner(settings)

        # Switch DB connection
        db_manager = DBRegistry.get()
        try:
            db_manager.db_disconnect(old_project)
        except Exception as e:
            logging.error(f"Could not disconnect from project {old_project}: {e}")
        try:
            db_manager.db_connect(DEMO_PROJECT_NAME)
        except RuntimeError as e:
            logging.error(f"Could not switch DB connection to {DEMO_PROJECT_NAME}: {e}")
    try:
        projects_manager.delete(project_name)
    except QValueException as e:
        raise HTTPException(status_code=400, detail=str(e)) from e
    return {"status": True}


@project_router.put(
    "/update",
    status_code=200,
    response_model=Project,
    summary="Update a project",
    description="Update an existing project's configuration. Only provided fields are updated.",
    responses={
        status.HTTP_200_OK: {"description": "Project updated"},
        status.HTTP_404_NOT_FOUND: {"description": "Project not found"},
    },
)
def update_project_endpoint(
    storage_location: Annotated[
        Path | None,
        Body(
            ...,
            description=(
                "Optional root folder for project data, used only when the "
                "storage backend supports a filesystem location."
            ),
            examples=["/data/qualibrate/projects/my_project"],
        ),
    ] = None,
    calibration_library_folder: Annotated[
        Path | None,
        Body(
            ...,
            description="Optional folder containing the calibration library.",
            examples=["/repos/calibration-lib"],
        ),
    ] = None,
    quam_state_path: Annotated[
        Path | None,
        Body(
            ...,
            description=("Optional path to an initial QUAM state JSON to seed the project."),
            examples=["/data/qualibrate/quam_state"],
        ),
    ] = None,
    database: Annotated[DBConfigRequest | None, Body(...)] = None,
    *,
    projects_manager: Annotated[ProjectsManagerBase, Depends(_get_projects_manager)],
) -> Project:
    """
    Update an existing project by name.

    Only the provided fields will be updated. Fields that are omitted
    will remain unchanged.

    Returns the updated Project object.

    ### Args
    - project_name (str): Name of the project to update.
    - storage_location (Path | None): Optional filesystem location for the
      project data if the backend supports it.
    - calibration_library_folder (Path | None): Path to the calibration
      library folder to associate with this project.
    - quam_state_path (Path | None): Path to an initial QUAM state file
      that will be set on project update.
    - database (DBConfigRequest | None): Optional database configuration
      for saving QUAM state.

    ### Returns
    - Project: The updated project.
    """
    project_name = projects_manager.project
    if project_name is None:
        raise HTTPException(status_code=404, detail="No active project configured")
    db_config = database.to_db_config() if database else None
    db_state = (
        database.to_db_state_config()
        if database
        else DatabaseStateConfig(
            {
                "is_connected": False,
            }
        )
    )
    try:
        projects_manager.update(
            project_name,
            storage_location=storage_location,
            calibration_library_folder=calibration_library_folder,
            quam_state_path=quam_state_path,
            database=db_config,
            database_state=db_state,
        )
    except QValueException as e:
        raise HTTPException(status_code=404, detail=str(e)) from e

    project = next(filter(lambda p: p.name == project_name, projects_manager.list()), None)
    if project is None:
        raise HTTPException(status_code=404, detail="Project not found after update")

    return project


@project_router.get(
    "/active",
    summary="Get active project",
    description="Return the name of the currently active project.",
    response_model=str | None,
    responses={
        status.HTTP_200_OK: {
            "description": "Active project name",
            "content": {
                "application/json": {
                    "examples": {
                        "active_example": {
                            "summary": "Active project",
                            "value": "experiment_alpha",
                        },
                        "no_active_project": {
                            "summary": "Active project not specified",
                            "value": None,
                        },
                    }
                }
            },
        }
    },
)
def get_active_project(
    projects_manager: Annotated[ProjectsManagerBase, Depends(_get_projects_manager)],
) -> str | None:
    """Name of the active project. Can be `None` if active project isn't set."""
    return projects_manager.project


@project_router.post(
    "/active",
    summary="Set active project",
    response_model=str,
    responses={
        status.HTTP_200_OK: {
            "description": "New active project name",
            "content": {
                "application/json": {
                    "examples": {
                        "set_example": {
                            "summary": "Active set",
                            "value": "my_project",
                        }
                    }
                }
            },
        }
    },
)
def set_active_project(
    active_project: Annotated[
        str,
        Body(
            ...,
            description="The project name to activate.",
            examples=["my_project", "experiment_alpha"],
            min_length=1,
        ),
    ],
    projects_manager: Annotated[ProjectsManagerBase, Depends(_get_projects_manager)],
    config_path: Annotated[Path, Depends(get_config_path)],
    settings: Annotated[QualibrateConfig, Depends(get_settings)],
) -> str:
    """Set the active project and notify runner if present. Returns the newly
    active project name.

    ### Notes
        If `settings.runner` is defined, the function will POST to
        `{runner.address_with_root}/refresh_settings`. Failures are logged.
    """
    old_project = projects_manager.project
    projects_manager.project = active_project
    routes_vars.ACTIVE_PROJECT_NOT_SET = False

    def notify_runner(q_settings: QualibrateConfig) -> None:
        if not q_settings.runner:
            return
        settings_update_url = urljoin(q_settings.runner.address_with_root, "refresh_settings")
        try:
            requests.post(settings_update_url, timeout=5)
        except requests.exceptions.RequestException:
            logging.error(
                f"Failed to send refresh settings request to {settings_update_url}",
            )

    notify_runner(settings)
    new_settings = get_settings(config_path)
    if settings.runner and new_settings.runner and new_settings.runner != settings.runner:
        notify_runner(new_settings)
    # TODO find a way to move logic to somewhere
    db_manager = DBRegistry.get()
    if old_project and db_manager.is_connected(old_project):
        try:
            db_manager.db_disconnect(old_project)
        except Exception as e:
            logging.error(f"Could not disconnect from project {old_project}: {e}")
    try:
        db_manager.db_connect(active_project)
    except RuntimeError as e:
        logging.error(f"Could not switch DB connection to project {active_project}: {e}")
    return active_project


@projects_router.get(
    "/",
    summary="List projects",
    response_model=list[Project],
    responses={
        status.HTTP_200_OK: {
            "description": "Array of project entries",
            "content": {
                "application/json": {
                    "examples": {
                        "list_example": {
                            "summary": "Two projects",
                            "value": [
                                {
                                    "name": "experiment_alpha",
                                    "path": ("/data/qualibrate/projects/experiment_alpha"),
                                    "created_at": "2025-08-01T10:00:00Z",
                                    "last_opened_at": "2025-09-01T15:30:00Z",
                                },
                                {
                                    "name": "my_project",
                                    "path": ("/data/qualibrate/projects/my_project"),
                                    "created_at": "2025-07-15T09:12:00Z",
                                    "last_opened_at": "2025-08-20T18:05:00Z",
                                },
                            ],
                        }
                    }
                }
            },
        }
    },
)
def get_projects_list(
    projects_manager: Annotated[ProjectsManagerBase, Depends(_get_projects_manager)],
) -> Sequence[Project]:
    """List all projects available in the configured storage backend."""
    return projects_manager.list()


@project_router.post(
    "/db/test-connection",
    summary="Test connection to project database",
    description="Check if the provided database configuration is reachable and credentials are valid.",
    response_model=bool,
    responses={
        200: {"description": "Returns true if connection succeeds, false otherwise"},
        500: {"description": "Unexpected internal error"},
    },
)
def test_db_connection(
    database: Annotated[
        TestConnectionRequest,
        Body(
            description="Database configuration to test.",
            examples=[
                {
                    "host": "localhost",
                    "port": 5432,
                    "database": "my_project_db",
                    "username": "postgres",
                    "password": "postgres",
                }
            ],
        ),
    ],
) -> bool:
    manager = DBRegistry.get()
    db_config = database.to_db_config()
    try:
        manager.test_connection(db_config)
        return True
    except RuntimeError as e:
        logging.warning(f"Failed to connect to database: {e}")
        return False
