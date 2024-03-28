from typing import Any, Optional, Sequence

from qualibrate.api.core.bases.root import RootBase
from qualibrate.api.core.timeline_db.branch import BranchTimelineDb
from qualibrate.api.core.timeline_db.node import NodeTimelineDb
from qualibrate.api.core.timeline_db.snapshot import SnapshotTimelineDb
from qualibrate.api.core.types import DocumentSequenceType, DocumentType, IdType
from qualibrate.api.core.utils.request_utils import get_with_db
from qualibrate.api.exceptions.classes.timeline_db import QJsonDbException

__all__ = ["RootTimelineDb"]


class RootTimelineDb(RootBase):
    def get_branch(self, branch_name: str) -> BranchTimelineDb:
        return BranchTimelineDb(branch_name)

    def _get_latest_snapshots(self, num: int = 50) -> DocumentSequenceType:
        result = get_with_db("snapshot/n_latest", params={"num": num})
        if result.status_code != 200:
            raise QJsonDbException("Latest snapshots wasn't retrieved.")
        return list(result.json())

    def _get_latest_snapshot(self) -> DocumentType:
        snapshots = self._get_latest_snapshots(1)
        if len(snapshots) != 1:
            raise QJsonDbException("Latest snapshot wasn't retrieved.")
        return snapshots[0]

    def get_snapshot(self, id: Optional[IdType] = None) -> SnapshotTimelineDb:
        if id is None:
            snapshot_data = self._get_latest_snapshot()
            return SnapshotTimelineDb(
                id=snapshot_data["id"], content=snapshot_data
            )
        return SnapshotTimelineDb(id=id)

    def get_node(self, id: Optional[IdType] = None) -> NodeTimelineDb:
        if id is None:
            snapshot_data = self._get_latest_snapshot()
            return NodeTimelineDb(
                node_id=snapshot_data["id"], snapshot_content=snapshot_data
            )
        return NodeTimelineDb(node_id=id)

    def get_latest_snapshots(
        self, num: int = 50
    ) -> Sequence[SnapshotTimelineDb]:
        snapshots = self._get_latest_snapshots(num)
        return [
            SnapshotTimelineDb(id=snapshot["id"], content=snapshot)
            for snapshot in snapshots
        ]

    def get_latest_nodes(self, num: int = 50) -> Sequence[NodeTimelineDb]:
        snapshots = self._get_latest_snapshots(num)
        return [
            NodeTimelineDb(node_id=snapshot["id"], snapshot_content=snapshot)
            for snapshot in snapshots
        ]

    def search_snapshot(self, snapshot_id: IdType, data_path: str) -> Any:
        result = get_with_db(
            f"/snapshot/{snapshot_id}/search/data/values",
            params={"data_path": data_path},
        )
        if result.status_code != 200:
            raise QJsonDbException("Branch history wasn't retrieved.")
        return result.json()
