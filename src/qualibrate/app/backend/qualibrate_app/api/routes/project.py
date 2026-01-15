import logging
from collections.abc import Sequence
from pathlib import Path
from typing import Annotated
from urllib.parse import urljoin

import requests
from fastapi import APIRouter, Body, Depends, HTTPException, Query, status
from qualibrate_config.models import QualibrateConfig, StorageType

from qualibrate_app.api.core.domain.bases.project import ProjectsManagerBase
from qualibrate_app.api.core.domain.local_storage.project import (
    ProjectsManagerLocalStorage,
)
from qualibrate_app.api.core.domain.timeline_db.project import (
    ProjectsManagerTimelineDb,
)
from qualibrate_app.api.core.models.project import Project
from qualibrate_app.api.routes.utils import vars as routes_vars
from qualibrate_app.config import (
    get_config_path,
    get_settings,
)

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
    return project_types[settings.storage.type](
        settings=settings, config_path=config_path
    )


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
            description=(
                "Optional path to an initial QUAM state JSON to seed the "
                "project."
            ),
            examples=["/data/qualibrate/quam_state"],
        ),
    ] = None,
    *,
    projects_manager: Annotated[
        ProjectsManagerBase,
        Depends(_get_projects_manager),
    ],
) -> Project:
    """
    Create a project in the configured storage backend. You can optionally set
    a custom storage location, a calibration library folder, and a path to a
    QUAM state.

    Returns created project name.

    ### Args
    - project_name (str): Name for the new project.
    - storage_location (Path | None): Optional filesystem location for the
    project data if the backend supports it.
    - calibration_library_folder (Path | None): Path to the calibration
    library folder to associate with this project.
    - quam_state_path (Path | None): Path to an initial QUAM state file
    that will be set on project creation.
    """
    projects_manager.create(
        project_name,
        storage_location=storage_location,
        calibration_library_folder=calibration_library_folder,
        quam_state_path=quam_state_path,
    )
    project = next(
        filter(lambda p: p.name == project_name, projects_manager.list()), None
    )
    if project is None:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Project not found",
        )
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
    projects_manager: Annotated[
        ProjectsManagerBase, Depends(_get_projects_manager)
    ],
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
    projects_manager: Annotated[
        ProjectsManagerBase, Depends(_get_projects_manager)
    ],
    config_path: Annotated[Path, Depends(get_config_path)],
    settings: Annotated[QualibrateConfig, Depends(get_settings)],
) -> str:
    """Set the active project and notify runner if present. Returns the newly
    active project name.

    ### Notes
        If `settings.runner` is defined, the function will POST to
        `{runner.address_with_root}/refresh_settings`. Failures are logged.
    """
    projects_manager.project = active_project
    routes_vars.ACTIVE_PROJECT_NOT_SET = False

    def notify_runner(q_settings: QualibrateConfig) -> None:
        if not q_settings.runner:
            return
        settings_update_url = urljoin(
            q_settings.runner.address_with_root, "refresh_settings"
        )
        try:
            requests.post(settings_update_url, timeout=5)
        except requests.exceptions.RequestException:
            logging.error(
                "Failed to send refresh settings request "
                f"to {settings_update_url}",
            )

    notify_runner(settings)
    new_settings = get_settings(config_path)
    if (
        settings.runner
        and new_settings.runner
        and new_settings.runner != settings.runner
    ):
        notify_runner(new_settings)
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
                                    "path": (
                                        "/data/qualibrate/projects"
                                        "/experiment_alpha"
                                    ),
                                    "created_at": "2025-08-01T10:00:00Z",
                                    "last_opened_at": "2025-09-01T15:30:00Z",
                                },
                                {
                                    "name": "my_project",
                                    "path": (
                                        "/data/qualibrate/projects/my_project"
                                    ),
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
    projects_manager: Annotated[
        ProjectsManagerBase, Depends(_get_projects_manager)
    ],
) -> Sequence[Project]:
    """List all projects available in the configured storage backend."""
    return projects_manager.list()
