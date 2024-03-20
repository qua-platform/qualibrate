from typing import Any
from urllib.parse import urljoin

from qualibrate.api.core.bases.root import RootBase
from qualibrate.api.core.types import DocumentSequenceType, IdType
from qualibrate.api.core.utils.request_utils import get_with_db
from qualibrate.api.core.json_db.node import NodeJsonDb
from qualibrate.api.core.json_db.branch import BranchJsonDb
from qualibrate.api.core.json_db.snapshot import SnapshotJsonDb
from qualibrate.api.exceptions.classes.json_db import QJsonDbException
from qualibrate.config import get_settings


__all__ = ["RootTimelineDb"]


class RootTimelineDb(RootBase):
    @staticmethod
    def get_branch(branch_name: str) -> BranchJsonDb:
        return BranchJsonDb(branch_name)

    @staticmethod
    def get_snapshot(id: IdType) -> SnapshotJsonDb:
        return SnapshotJsonDb(id=id)

    @staticmethod
    def get_node(id: IdType) -> NodeJsonDb:
        return NodeJsonDb(snapshot_id=id)

    def get_last_snapshots(
        self, branch_name: str, num_snapshots: int = 50
    ) -> DocumentSequenceType:
        return self.get_branch(branch_name).get_latest_snapshots(num_snapshots)

    def get_last_nodes(
        self, branch_name: str, num_snapshots: int = 50
    ) -> DocumentSequenceType:
        return self.get_branch(branch_name).get_latest_nodes(num_snapshots)

    @staticmethod
    def search_snapshot(snapshot_id: IdType, data_path: str) -> Any:
        settings = get_settings()
        req_url = urljoin(
            str(settings.timeline_db.address),
            f"/snapshot/{snapshot_id}/search/data/values",
        )
        result = get_with_db(req_url, params={"data_path": data_path})
        if result.status_code != 200:
            raise QJsonDbException("Branch history wasn't retrieved.")
        return result.json()
