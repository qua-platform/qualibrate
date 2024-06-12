from datetime import datetime
from typing import Sequence, Union, cast
from urllib.parse import urljoin

import requests
from pydantic import ValidationError

from qualibrate_app.api.core.domain.bases.project import ProjectsManagerBase
from qualibrate_app.api.core.models.project import Project
from qualibrate_app.api.core.utils.request_utils import request_with_db
from qualibrate_app.api.exceptions.classes.timeline_db import QJsonDbException
from qualibrate_app.api.exceptions.classes.values import QValueException
from qualibrate_app.config import (
    CONFIG_KEY,
    QualibrateSettings,
    QualibrateSettingsSetup,
)


class ProjectsManagerTimelineDb(ProjectsManagerBase):
    def _check_db_project_exists(self, project_name: str) -> bool:
        response = request_with_db(
            "/database/connect",
            db_name=project_name,
            host=self._settings.timeline_db.address,
            timeout=self._settings.timeline_db.timeout,
        )
        return response.status_code == 200 and response.json() is True

    def _active_project_setter(self, value: str) -> None:
        if not self._check_db_project_exists(value):
            raise QJsonDbException(
                f"Can't check if project {value} exists in timeline DB."
            )
        self._set_user_storage_project(value)

    def _set_user_storage_project(self, project_name: str) -> None:
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
        self._settings.project = cast(str, qs.project)
        self._settings.user_storage = qs.user_storage

    def create(self, project_name: str) -> str:
        if any(project.name == project_name for project in self.list()):
            raise QValueException(f"Project {project_name} already exists.")
        response = request_with_db(
            "/database/create",
            db_name=project_name,
            host=self._settings.timeline_db.address,
            timeout=self._settings.timeline_db.timeout,
            method=requests.post,
        )

        if response.status_code != 200 or response.json() != project_name:
            raise QJsonDbException(f"Can't create project {project_name}.")
        new_project_path = self._resolve_new_project_path(
            project_name, self._settings.project, self._settings.user_storage
        )
        new_project_path.mkdir(parents=True, exist_ok=True)
        return project_name

    def list(self) -> Sequence[Project]:
        response = requests.get(
            urljoin(str(self._settings.timeline_db.address), "/database/list"),
            timeout=self._settings.timeline_db.timeout,
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
