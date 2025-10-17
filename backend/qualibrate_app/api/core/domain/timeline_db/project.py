from collections.abc import Sequence
from datetime import datetime
from pathlib import Path
from urllib.parse import urljoin

import requests

from qualibrate_app.api.core.domain.bases.project import ProjectsManagerBase
from qualibrate_app.api.core.models.project import Project
from qualibrate_app.api.core.utils.request_utils import request_with_db
from qualibrate_app.api.exceptions.classes.timeline_db import QJsonDbException
from qualibrate_app.api.exceptions.classes.values import QValueException


class ProjectsManagerTimelineDb(ProjectsManagerBase):
    def _check_db_project_exists(self, project_name: str) -> bool:
        response = request_with_db(
            "database/connect",
            db_name=project_name,
            host=self._settings.timeline_db.address_with_root,
            timeout=self._settings.timeline_db.timeout,
        )
        return response.status_code == 200 and response.json() is True

    def _active_project_setter(self, value: str) -> None:
        if not self._check_db_project_exists(value):
            raise QJsonDbException(
                f"Can't check if project {value} exists in timeline DB."
            )
        self._settings.project = value

    def create(
        self,
        project_name: str,
        storage_location: Path | None = None,
        calibration_library_folder: Path | None = None,
        quam_state_path: Path | None = None,
    ) -> str:
        if any(project.name == project_name for project in self.list()):
            raise QValueException(f"Project {project_name} already exists.")
        response = request_with_db(
            "database/create",
            db_name=project_name,
            host=self._settings.timeline_db.address_with_root,
            timeout=self._settings.timeline_db.timeout,
            method=requests.post,
        )

        if response.status_code != 200 or response.json() != project_name:
            raise QJsonDbException(f"Can't create project {project_name}.")
        return super().create(
            project_name,
            storage_location,
            calibration_library_folder,
            quam_state_path,
        )

    def list(self) -> Sequence[Project]:
        response = requests.get(
            urljoin(
                self._settings.timeline_db.address_with_root, "database/list"
            ),
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
