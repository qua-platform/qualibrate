from abc import ABC
from enum import IntEnum

from qualibrate_config.models import QualibrateConfig

from qualibrate_app.api.core.domain.bases.base_with_settings import (
    DomainWithConfigBase,
)
from qualibrate_app.api.core.domain.bases.i_dump import IDump
from qualibrate_app.api.core.domain.bases.snapshot import (
    SnapshotBase,
    SnapshotLoadTypeFlag,
)
from qualibrate_app.api.core.domain.bases.storage import DataFileStorage
from qualibrate_app.api.core.models.node import Node as NodeModel
from qualibrate_app.api.core.models.snapshot import (
    SimplifiedSnapshotWithMetadata,
)
from qualibrate_app.api.core.types import IdType
from qualibrate_app.api.core.utils.path.common import resolve_and_check_relative
from qualibrate_app.api.exceptions.classes.storage import (
    QNotADirectoryException,
)

__all__ = ["NodeBase", "NodeLoadType"]

from qualibrate_app.config.vars import METADATA_OUT_PATH


class NodeLoadType(IntEnum):
    Empty = 0
    Snapshot = 1
    Full = 2


class NodeBase(DomainWithConfigBase, IDump, ABC):
    def __init__(
        self,
        node_id: IdType,
        snapshot: SnapshotBase,
        settings: QualibrateConfig,
    ) -> None:
        super().__init__(settings)
        self._node_id = node_id
        self._load_type = NodeLoadType.Empty
        self._snapshot = snapshot
        self._storage: DataFileStorage | None = None

    @property
    def load_type(self) -> NodeLoadType:
        return self._load_type

    def load(self, load_type: NodeLoadType) -> None:
        if self._load_type == NodeLoadType.Full:
            return
        self._snapshot.load_from_flag(SnapshotLoadTypeFlag.Metadata)
        if load_type < NodeLoadType.Full:
            return
        self._fill_storage()

    @property
    def snapshot(self) -> SnapshotBase | None:
        return self._snapshot

    @property
    def storage(self) -> DataFileStorage | None:
        return self._storage

    def _fill_storage(self) -> None:
        metadata = self._snapshot.metadata
        if metadata is None or not isinstance(
            metadata.get(METADATA_OUT_PATH), str
        ):
            self._storage = None
            self._load_type = NodeLoadType.Snapshot
            return
        rel_output_path = metadata[METADATA_OUT_PATH]
        abs_output_path = resolve_and_check_relative(
            self._settings.storage.location,
            metadata[METADATA_OUT_PATH],
        )
        if not abs_output_path.is_dir():
            raise QNotADirectoryException(
                f"{rel_output_path} is not a directory"
            )
        self._storage = DataFileStorage(abs_output_path, self._settings)
        self._load_type = NodeLoadType.Full

    def dump(self) -> NodeModel:
        return NodeModel(
            id=self._node_id,
            snapshot=SimplifiedSnapshotWithMetadata(
                **self._snapshot.dump().model_dump()
            ),
            storage=(None if self._storage is None else self._storage.dump()),
        )
