from typing import Any, Optional, Sequence, Tuple, Union

from qualibrate.api.core.domain.bases.root import RootBase
from qualibrate.api.core.domain.timeline_db.branch import BranchTimelineDb
from qualibrate.api.core.domain.timeline_db.node import NodeTimelineDb
from qualibrate.api.core.domain.timeline_db.snapshot import SnapshotTimelineDb
from qualibrate.api.core.types import DocumentSequenceType, DocumentType, IdType
from qualibrate.api.core.utils.request_utils import get_with_db
from qualibrate.api.exceptions.classes.timeline_db import QJsonDbException

__all__ = ["RootTimelineDb"]


class RootTimelineDb(RootBase):
    def get_branch(self, branch_name: str) -> BranchTimelineDb:
        return BranchTimelineDb(branch_name)

    def _get_latest_snapshots(
        self,
        page: int,
        per_page: int,
        reverse: bool,
    ) -> Tuple[int, DocumentSequenceType]:
        result = get_with_db(
            "snapshot/n_latest",
            params={"page": page, "per_page": per_page, "reverse": reverse},
        )
        if result.status_code != 200:
            raise QJsonDbException("Latest snapshots wasn't retrieved.")
        parsed = result.json()
        return parsed["total"], list(parsed["items"])

    def _get_latest_snapshot(self) -> DocumentType:
        _, snapshots = self._get_latest_snapshots(1, 1, False)
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
        self,
        page: int = 1,
        per_page: int = 50,
        reverse: bool = False,
    ) -> Tuple[int, Sequence[SnapshotTimelineDb]]:
        total, snapshots = self._get_latest_snapshots(page, per_page, reverse)
        return total, [
            SnapshotTimelineDb(id=snapshot["id"], content=snapshot)
            for snapshot in snapshots
        ]

    def get_latest_nodes(
        self,
        page: int = 1,
        per_page: int = 50,
        reverse: bool = False,
    ) -> Tuple[int, Sequence[NodeTimelineDb]]:
        total, snapshots = self._get_latest_snapshots(page, per_page, reverse)
        return total, [
            NodeTimelineDb(node_id=snapshot["id"], snapshot_content=snapshot)
            for snapshot in snapshots
        ]

    def search_snapshot(
        self, snapshot_id: IdType, data_path: Sequence[Union[str, int]]
    ) -> Any:
        data_path_joined = ".".join(map(str, data_path))
        result = get_with_db(
            f"/snapshot/{snapshot_id}/search/data/values",
            params={"data_path": data_path_joined},
        )
        if result.status_code != 200:
            raise QJsonDbException("Branch history wasn't retrieved.")
        return result.json()
