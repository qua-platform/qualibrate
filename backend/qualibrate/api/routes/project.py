from typing import Annotated, Sequence

from fastapi import APIRouter, Depends

from qualibrate.api.core.domain.bases.project import ProjectsManagerBase
from qualibrate.api.core.domain.local_storage.project import (
    ProjectsManagerLocalStorage,
)
from qualibrate.api.core.domain.timeline_db.project import (
    ProjectsManagerTimelineDb,
)
from qualibrate.api.core.models.project import Project
from qualibrate.config import (
    QualibrateSettings,
    StorageType,
    get_settings,
)

project_router = APIRouter(prefix="/projects", tags=["project"])


def _get_projects_manager(
    settings: Annotated[QualibrateSettings, Depends(get_settings)],
) -> ProjectsManagerBase:
    project_types = {
        StorageType.local_storage: ProjectsManagerLocalStorage,
        StorageType.timeline_db: ProjectsManagerTimelineDb,
    }
    return project_types[settings.storage_type]()


@project_router.get("/list")
def get_projects_list(
    projects_manager: Annotated[
        ProjectsManagerBase, Depends(_get_projects_manager)
    ],
) -> Sequence[Project]:
    return projects_manager.list()


@project_router.post("/create")
def create_project(
    project_name: str,
    projects_manager: Annotated[
        ProjectsManagerBase, Depends(_get_projects_manager)
    ],
    settings: Annotated[QualibrateSettings, Depends(get_settings)],
) -> str:
    return projects_manager.create(project_name, settings)


@project_router.get("/active")
def get_active_project(
    projects_manager: Annotated[
        ProjectsManagerBase, Depends(_get_projects_manager)
    ],
) -> str:
    return projects_manager.project


@project_router.post("/active")
def set_active_project(
    active_project: str,
    projects_manager: Annotated[
        ProjectsManagerBase, Depends(_get_projects_manager)
    ],
) -> str:
    projects_manager.project = active_project
    return active_project
