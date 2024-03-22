from typing import Any, Optional
from urllib.parse import urljoin

from qualibrate.api.core.bases.root import RootBase
from qualibrate.api.core.types import DocumentSequenceType, IdType
from qualibrate.api.core.utils.request_utils import get_with_db
from qualibrate.api.core.timeline_db.node import NodeTimelineDb
from qualibrate.api.core.timeline_db.branch import BranchTimelineDb
from qualibrate.api.core.timeline_db.snapshot import SnapshotTimelineDb
from qualibrate.api.exceptions.classes.timeline_db import QJsonDbException
from qualibrate.config import get_settings


__all__ = ["RootTimelineDb"]


class RootTimelineDb(RootBase):
    def get_branch(self, branch_name: str) -> BranchTimelineDb:
        return BranchTimelineDb(branch_name)

    def get_snapshot(self, id: Optional[IdType] = None) -> SnapshotTimelineDb:
        if id is None:
            # TODO: load latest snapshot from db
            raise NotImplementedError
        return SnapshotTimelineDb(id=id)

    def get_node(self, id: Optional[IdType] = None) -> NodeTimelineDb:
        if id is None:
            # TODO: load latest snapshot from db
            raise NotImplementedError
        return NodeTimelineDb(node_id=id)

    def get_latest_snapshots(self, num: int = 50) -> DocumentSequenceType:
        # TODO: load latest snapshots (independent from branch)
        raise NotImplementedError
        # return self.get_latest_snapshots(num)

    def get_latest_nodes(self, num: int = 50) -> DocumentSequenceType:
        # TODO: load latest snapshots (independent from branch)
        # return self.get_latest_nodes(num)
        raise NotImplementedError

    def search_snapshot(self, snapshot_id: IdType, data_path: str) -> Any:
        settings = get_settings()
        req_url = urljoin(
            str(settings.timeline_db.address),
            f"/snapshot/{snapshot_id}/search/data/values",
        )
        result = get_with_db(req_url, params={"data_path": data_path})
        if result.status_code != 200:
            raise QJsonDbException("Branch history wasn't retrieved.")
        return result.json()
