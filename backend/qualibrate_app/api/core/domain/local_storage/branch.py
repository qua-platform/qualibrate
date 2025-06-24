from collections.abc import Sequence
from datetime import datetime
from typing import Optional

from qualibrate_config.models import QualibrateConfig

from qualibrate_app.api.core.domain.bases.branch import (
    BranchBase,
    BranchLoadType,
)
from qualibrate_app.api.core.domain.bases.node import NodeBase, NodeLoadType
from qualibrate_app.api.core.domain.bases.snapshot import (
    SnapshotBase,
    SnapshotLoadTypeFlag,
)
from qualibrate_app.api.core.domain.local_storage.node import NodeLocalStorage
from qualibrate_app.api.core.domain.local_storage.snapshot import (
    SnapshotLocalStorage,
)
from qualibrate_app.api.core.domain.local_storage.utils.node_utils import (
    find_latest_node_id,
    find_n_latest_nodes_ids,
)
from qualibrate_app.api.core.models.branch import Branch as BranchModel
from qualibrate_app.api.core.types import DocumentType, IdType
from qualibrate_app.api.exceptions.classes.storage import QFileNotFoundException

__all__ = ["BranchLocalStorage"]


class BranchLocalStorage(BranchBase):
    def __init__(
        self,
        name: str,
        content: Optional[DocumentType] = None,
        *,
        settings: QualibrateConfig,
    ):
        # Temporary branch name has no effect
        super().__init__(name, content, settings=settings)

    @property
    def created_at(self) -> datetime:
        return datetime.fromtimestamp(
            self._settings.storage.location.stat().st_mtime
        ).astimezone()

    def load(self, load_type: BranchLoadType) -> None:
        pass

    def _get_latest_node_id(self, error_msg: str) -> IdType:
        id = next(
            find_n_latest_nodes_ids(
                self._settings.storage.location,
                1,
                1,
                self._settings.project,
            ),
            None,
        )
        if id is None:
            raise QFileNotFoundException(f"There is no {error_msg}")
        return id

    def get_snapshot(self, id: Optional[IdType] = None) -> SnapshotBase:
        if id is None:
            id = self._get_latest_node_id("snapshots")
        return SnapshotLocalStorage(id, settings=self._settings)

    def get_node(self, id: Optional[IdType] = None) -> NodeBase:
        if id is None:
            id = self._get_latest_node_id("nodes")
        return NodeLocalStorage(id, settings=self._settings)

    def get_latest_snapshots(
        self,
        page: int = 0,
        per_page: int = 50,
        reverse: bool = False,
    ) -> tuple[int, Sequence[SnapshotBase]]:
        # TODO: use reverse
        storage_location = self._settings.storage.location
        ids = find_n_latest_nodes_ids(
            storage_location,
            page,
            per_page,
            self._settings.project,
        )
        snapshots = [
            SnapshotLocalStorage(id, settings=self._settings) for id in ids
        ]
        for snapshot in snapshots:
            snapshot.load_from_flag(SnapshotLoadTypeFlag.Metadata)
        total = find_latest_node_id(storage_location)
        return total, snapshots

    def get_latest_nodes(
        self,
        page: int = 0,
        per_page: int = 50,
        reverse: bool = False,
    ) -> tuple[int, Sequence[NodeBase]]:
        # TODO: use reverse
        storage_location = self._settings.storage.location
        ids = find_n_latest_nodes_ids(
            storage_location,
            page,
            per_page,
            self._settings.project,
        )
        nodes = [NodeLocalStorage(id, settings=self._settings) for id in ids]
        for node in nodes:
            node.load(NodeLoadType.Full)
        total = find_latest_node_id(storage_location)
        return total, nodes

    def dump(self) -> BranchModel:
        return BranchModel(
            id=1,
            created_at=self.created_at,
            name=self._name,
            snapshot_id=-1,
        )
