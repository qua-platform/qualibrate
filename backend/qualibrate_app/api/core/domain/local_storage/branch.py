from collections.abc import Sequence
from datetime import datetime
from pathlib import Path

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
from qualibrate_app.api.core.domain.local_storage.utils.local_path_id import (
    IdToLocalPath,
)
from qualibrate_app.api.core.domain.local_storage.utils.node_utils import (
    find_nodes_ids_by_filter,
)
from qualibrate_app.api.core.models.branch import Branch as BranchModel
from qualibrate_app.api.core.models.snapshot import SnapshotSearchResult
from qualibrate_app.api.core.types import (
    DocumentType,
    IdType,
    PageFilter,
    SearchWithIdFilter,
)
from qualibrate_app.api.core.utils import find_utils
from qualibrate_app.api.core.utils.slice import get_page_slice
from qualibrate_app.api.exceptions.classes.storage import QFileNotFoundException

__all__ = ["BranchLocalStorage"]


class BranchLocalStorage(BranchBase):
    def __init__(
        self,
        name: str,
        content: DocumentType | None = None,
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
        node_id = next(
            find_nodes_ids_by_filter(
                self._settings.storage.location,
                project_name=self._settings.project,
                descending=True,
            ),
            None,
        )
        if node_id is None:
            raise QFileNotFoundException(f"There is no {error_msg}")
        return node_id

    def get_snapshot(self, snapshot_id: IdType | None = None) -> SnapshotBase:
        if snapshot_id is None:
            snapshot_id = self._get_latest_node_id("snapshots")
        return SnapshotLocalStorage(snapshot_id, settings=self._settings)

    def get_node(self, id: IdType | None = None) -> NodeBase:
        if id is None:
            id = self._get_latest_node_id("nodes")
        return NodeLocalStorage(id, settings=self._settings)

    def _get_latest_snapshots_ids(
        self,
        storage_location: Path,
        pages_filter: PageFilter,
        search_filter: SearchWithIdFilter | None = None,
        descending: bool = False,
    ) -> Sequence[IdType]:
        ids = find_nodes_ids_by_filter(
            storage_location,
            search_filter=search_filter,
            project_name=self._settings.project,
            descending=descending,
        )
        return get_page_slice(ids, pages_filter)

    def get_latest_snapshots(
        self,
        pages_filter: PageFilter,
        search_filter: SearchWithIdFilter | None = None,
        descending: bool = False,
    ) -> tuple[int, Sequence[SnapshotBase]]:
        storage_location = self._settings.storage.location
        ids_paged = self._get_latest_snapshots_ids(
            storage_location,
            pages_filter=pages_filter,
            search_filter=search_filter,
            descending=descending,
        )
        snapshots = [
            SnapshotLocalStorage(id, settings=self._settings)
            for id in ids_paged
        ]
        for snapshot in snapshots:
            snapshot.load_from_flag(SnapshotLoadTypeFlag.Metadata)
        total = len(
            IdToLocalPath().get_project_manager(
                self._settings.project, storage_location
            )
        )
        return total, snapshots

    def get_latest_nodes(
        self,
        pages_filter: PageFilter,
        search_filter: SearchWithIdFilter | None = None,
        descending: bool = False,
    ) -> tuple[int, Sequence[NodeBase]]:
        storage_location = self._settings.storage.location
        ids_paged = self._get_latest_snapshots_ids(
            storage_location,
            pages_filter=pages_filter,
            search_filter=search_filter,
            descending=descending,
        )
        nodes = [
            NodeLocalStorage(id, settings=self._settings) for id in ids_paged
        ]
        for node in nodes:
            node.load(NodeLoadType.Full)
        total = len(
            IdToLocalPath().get_project_manager(
                self._settings.project, storage_location
            )
        )
        return total, nodes

    def dump(self) -> BranchModel:
        return BranchModel(
            id=1,
            created_at=self.created_at,
            name=self._name,
            snapshot_id=-1,
        )

    def search_snapshots_data(
        self,
        *,
        pages_filter: PageFilter,
        search_filter: SearchWithIdFilter | None = None,
        data_path: Sequence[str | int],
        filter_no_change: bool = True,
        descending: bool = False,
    ) -> tuple[int, Sequence[SnapshotSearchResult]]:
        storage_location = self._settings.storage.location
        ids = find_nodes_ids_by_filter(
            storage_location,
            search_filter=search_filter,
            project_name=self._settings.project,
            descending=descending,
        )
        snapshots = (
            SnapshotLocalStorage(id, settings=self._settings) for id in ids
        )
        if descending:
            snapshots_with_data = (
                find_utils.search_snapshots_data_with_filter_descending(
                    snapshots, data_path, filter_no_change
                )
            )
        else:
            snapshots_with_data = (
                find_utils.search_snapshots_data_with_filter_ascending(
                    snapshots, data_path, filter_no_change
                )
            )
        return 0, get_page_slice(snapshots_with_data, pages_filter)
