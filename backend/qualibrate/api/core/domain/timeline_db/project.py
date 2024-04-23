from datetime import datetime
from typing import Sequence, Union, cast
from urllib.parse import urljoin

import requests
from pydantic import ValidationError

from qualibrate.api.core.domain.bases.project import ProjectsManagerBase
from qualibrate.api.core.models.project import Project
from qualibrate.api.exceptions.classes.timeline_db import QJsonDbException
from qualibrate.api.exceptions.classes.values import QValueException
from qualibrate.config import (
    CONFIG_KEY,
    QualibrateSettings,
    QualibrateSettingsSetup,
    get_settings,
)


class ProjectsManagerTimelineDb(ProjectsManagerBase):
    def _check_db_project_exists(
        self, project_name: str, settings: QualibrateSettings
    ) -> bool:
        response = requests.get(
            urljoin(str(settings.timeline_db.address), "/database/connect"),
            params={"db_name": project_name},
            timeout=settings.timeline_db.timeout,
        )
        return response.status_code == 200 and response.json() is True

    def _active_project_setter(self, value: str) -> None:
        settings = get_settings()
        if not self._check_db_project_exists(value, settings):
            raise QJsonDbException(
                f"Can't check if project {value} exists in timeline DB."
            )
        self._set_user_storage_project(value, settings)

    def _set_user_storage_project(
        self, project_name: str, settings: QualibrateSettings
    ) -> None:
        raw_config, new_config = self._get_raw_and_resolved_ref_config(
            project_name
        )
        qs_dict = new_config.get(CONFIG_KEY, {})
        qs: Union[QualibrateSettings, QualibrateSettingsSetup]
        try:
            qs = QualibrateSettings(**qs_dict)
        except ValidationError as ex:
            errors = ex.errors(include_url=False, include_input=False)
            if len(errors) != 1 or not (
                errors[0]["type"] == "path_not_directory"
                and errors[0]["loc"] == ("user_storage",)
            ):
                raise
            qs = QualibrateSettingsSetup(**qs_dict)
        settings.project = cast(str, qs.project)
        settings.user_storage = qs.user_storage

    def create(self, project_name: str, settings: QualibrateSettings) -> str:
        settings = get_settings()
        exists = self.list()
        if project_name in exists:
            raise QValueException(f"Project {project_name} already exists.")
        response = requests.post(
            urljoin(str(settings.timeline_db.address), "/database/create"),
            params={"db_name": project_name},
            timeout=settings.timeline_db.timeout,
        )
        if response.status_code != 200 or response.json() != project_name:
            raise QJsonDbException(f"Can't create project {project_name}.")
        new_project_path = self._resolve_new_project_path(
            project_name, settings.project, settings.user_storage
        )
        new_project_path.mkdir(parents=True, exist_ok=True)
        return project_name

    def list(self) -> Sequence[Project]:
        settings = get_settings()
        response = requests.get(
            urljoin(str(settings.timeline_db.address), "/database/list"),
            timeout=settings.timeline_db.timeout,
        )
        if response.status_code != 200:
            raise QJsonDbException("Can't resolve list of projects.")
        return list(
            Project(
                name=name,
                nodes_number=-1,
                created_at=datetime.fromtimestamp(0),
                last_modified_at=datetime.fromtimestamp(0),
            )
            for name in response.json()
        )
