from datetime import datetime
from enum import IntEnum
from typing import Optional
from urllib.parse import urljoin

from qualibrate.api.core.types import DocumentType
from qualibrate.api.core.utils.request_utils import get_with_db
from qualibrate.api.core.json_db.snapshot import SnapshotJsonDb
from qualibrate.api.exceptions.classes.json_db import QJsonDbException
from qualibrate.config import get_settings


__all__ = ["BranchJsonDb", "BranchLoadType"]


class BranchLoadType(IntEnum):
    Empty = 0
    Full = 1


class BranchJsonDb:
    def __init__(self, name: str, content: Optional[DocumentType] = None):
        self._name = name
        if content is None:
            self.content = {}
            self._load_type = BranchLoadType.Empty
            return
        self.content = dict(content)
        self._load_type = BranchLoadType.Full

    @property
    def load_type(self) -> BranchLoadType:
        return self._load_type

    @property
    def name(self) -> str:
        return self._name

    @property
    def created_at(self) -> Optional[datetime]:
        if "created_at" not in self.content:
            return None
        return datetime.fromisoformat(str(self.content.get("created_at")))

    def load(self) -> None:
        if self._load_type == BranchLoadType.Full:
            return
        settings = get_settings()
        req_url = urljoin(
            str(settings.timeline_db.address), f"branch/{self._name}/"
        )
        result = get_with_db(req_url)
        no_branch_ex = QJsonDbException("Branch data wasn't retrieved.")
        if result.status_code != 200:
            raise no_branch_ex
        content = result.json()
        if self.content is None:
            raise no_branch_ex
        self.content.update(content)
        self._load_type = BranchLoadType.Full

    def get_last_snapshots(self, num_snapshots: int = 50) -> list[DocumentType]:
        """Retrieve last num_snapshots from this branch"""
        settings = get_settings()
        req_url = urljoin(
            str(settings.timeline_db.address),
            f"branch/{self._name}/history",
        )
        result = get_with_db(
            req_url,
            params={"metadata": True, "num_snapshots": num_snapshots},
        )
        if result.status_code != 200:
            raise QJsonDbException("Branch history wasn't retrieved.")
        return list(result.json())

    def get_snapshot(self, id: int) -> SnapshotJsonDb:
        return SnapshotJsonDb(id=id)
