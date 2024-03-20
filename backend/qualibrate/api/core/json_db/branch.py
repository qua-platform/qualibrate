from datetime import datetime
from typing import Optional
from urllib.parse import urljoin

from qualibrate.api.core.types import DocumentType, DocumentSequenceType, IdType
from qualibrate.api.core.bases.node import NodeBase
from qualibrate.api.core.bases.branch import BranchBase, BranchLoadType
from qualibrate.api.core.bases.snapshot import SnapshotBase
from qualibrate.api.core.utils.request_utils import get_with_db
from qualibrate.api.core.json_db.node import NodeJsonDb
from qualibrate.api.core.json_db.snapshot import SnapshotJsonDb
from qualibrate.api.exceptions.classes.json_db import QJsonDbException
from qualibrate.config import get_settings


__all__ = ["BranchJsonDb", "BranchLoadType"]


class BranchJsonDb(BranchBase):
    def __init__(self, name: str, content: Optional[DocumentType] = None):
        super().__init__(name, content)

    @property
    def created_at(self) -> Optional[datetime]:
        if "created_at" not in self.content:
            return None
        return datetime.fromisoformat(str(self.content.get("created_at")))

    def load(self, load_type: BranchLoadType) -> None:
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
        if content is None:
            raise no_branch_ex
        self.content.update(content)
        self._load_type = BranchLoadType.Full

    def get_latest_snapshots(
        self, num_snapshots: int = 50
    ) -> DocumentSequenceType:
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

    def get_latest_nodes(self, num_snapshots: int = 50) -> DocumentSequenceType:
        """Retrieve last num_snapshots from this branch"""
        # TODO: discuss about return type
        raise NotImplementedError()
        # settings = get_settings()
        # req_url = urljoin(
        #     str(settings.json_db.address),
        #     f"branch/{self._name}/history",
        # )
        # result = get_with_db(
        #     req_url,
        #     params={"metadata": True, "num_snapshots": num_snapshots},
        # )
        # if result.status_code != 200:
        #     raise QJsonDbException("Branch history wasn't retrieved.")
        # snapshots = list(result.json())
        # nodes = [
        #     NodeJsonDb(
        #         snapshot=SnapshotJsonDb(
        #             id=snapshot.get("id"),
        #             content=snapshot,
        #         )
        #     )
        #     for snapshot in snapshots
        # ]
        # return nodes

    def get_snapshot(self, id: IdType) -> SnapshotBase:
        # TODO: Check if snapshot is part of branch history
        return SnapshotJsonDb(id=id)

    def get_node(self, id: IdType) -> NodeBase:
        # TODO: Check if snapshot is part of branch history
        return NodeJsonDb(snapshot_id=id)
