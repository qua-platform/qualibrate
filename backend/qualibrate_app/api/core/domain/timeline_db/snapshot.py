from collections.abc import Mapping, Sequence
from datetime import datetime
from typing import Any, Optional, Union, cast

from qualibrate_config.models import (
    QualibrateConfig,
)

from qualibrate_app.api.core.domain.bases.snapshot import (
    SnapshotBase,
    SnapshotLoadType,
)
from qualibrate_app.api.core.types import (
    DocumentSequenceType,
    DocumentType,
    IdType,
)
from qualibrate_app.api.core.utils.find_utils import get_subpath_value
from qualibrate_app.api.core.utils.request_utils import request_with_db
from qualibrate_app.api.core.utils.snapshots_compare import jsonpatch_to_mapping
from qualibrate_app.api.exceptions.classes.timeline_db import QJsonDbException

__all__ = ["SnapshotTimelineDb"]


class SnapshotTimelineDb(SnapshotBase):
    def __init__(
        self,
        id: IdType,
        content: Optional[DocumentType] = None,
        *,
        settings: QualibrateConfig,
    ):
        super().__init__(id, content, settings=settings)

    def load(self, load_type: SnapshotLoadType) -> None:
        if load_type <= self._load_type:
            return None
        fields: Optional[list[str]] = ["id", "_id", "parents", "created_at"]
        if fields is not None and load_type == SnapshotLoadType.Metadata:
            fields.append("metadata")
        elif load_type >= SnapshotLoadType.Data:
            fields = None
        params = None if fields is None else {"fields": fields}
        timeline_db_config = self.timeline_db_config
        result = request_with_db(
            f"snapshot/{self.id}/",
            params=params,
            db_name=self._settings.project,
            host=timeline_db_config.address_with_root,
            timeout=timeline_db_config.timeout,
        )
        no_snapshot_ex = QJsonDbException("Snapshot data wasn't retrieved.")
        if result.status_code != 200:
            raise no_snapshot_ex
        content = result.json()
        if content is None:
            raise no_snapshot_ex
        if fields is None or "metadata" in fields:  # metadata was requested
            content["metadata"] = content.get("metadata", {})
            self._load_type = SnapshotLoadType.Metadata
        if fields is None:  # data was requested
            content["data"] = content.get("data", {})
            self._load_type = SnapshotLoadType.Full
        self.content.update(content)

    @property
    def load_type(self) -> SnapshotLoadType:
        return self._load_type

    @property
    def id(self) -> Optional[IdType]:
        return self._id

    @property
    def created_at(self) -> Optional[datetime]:
        if "created_at" not in self.content:
            return None
        return datetime.fromisoformat(str(self.content.get("created_at")))

    @property
    def parents(self) -> Optional[list[IdType]]:
        return self.content.get("parents")

    def search(
        self,
        search_path: Sequence[Union[str, int]],
        load: bool = False,
    ) -> Optional[DocumentSequenceType]:
        """Make search in current instance of Snapshot."""
        if self._load_type < SnapshotLoadType.Data and not load:
            return None
        self.load(SnapshotLoadType.Data)
        data = self.data
        if data is None:
            return None
        return get_subpath_value(data, search_path)

    def get_latest_snapshots(
        self, page: int = 1, per_page: int = 50, reverse: bool = False
    ) -> tuple[int, Sequence[SnapshotBase]]:
        timeline_db_config = self.timeline_db_config
        result = request_with_db(
            f"snapshot/{self.id}/history",
            params={"page": page, "per_page": per_page, "reverse": reverse},
            db_name=self._settings.project,
            host=timeline_db_config.address_with_root,
            timeout=timeline_db_config.timeout,
        )
        if result.status_code != 200:
            raise QJsonDbException("Snapshot history wasn't retrieved.")
        data = dict(result.json())

        return (
            cast(int, data["total"]),
            [
                SnapshotTimelineDb(
                    int(snapshot["id"]), snapshot, settings=self._settings
                )
                for snapshot in data["items"]
            ],
        )

    def compare_by_id(
        self, other_snapshot_int: int
    ) -> Mapping[str, Mapping[str, Any]]:
        if self.id == other_snapshot_int:
            return {}
        timeline_db_config = self.timeline_db_config
        response = request_with_db(
            "action/compare",
            params={"left_id": self.id, "right_id": other_snapshot_int},
            db_name=self._settings.project,
            host=timeline_db_config.address_with_root,
            timeout=timeline_db_config.timeout,
        )
        if response.status_code != 200:
            raise QJsonDbException("Difference wasn't retrieved.")
        result = dict(response.json())
        original = dict(result["original"])
        patch = result.get("patch")
        if patch is None:
            return {}
        return jsonpatch_to_mapping(
            original, cast(Sequence[Mapping[str, Any]], patch)
        )

    def update_entry(self, updates: Mapping[str, Any]) -> bool:
        # TODO: update timeline db snapshot entry
        return False

    def extract_state_update_type(
        self,
        path: str,
        **kwargs: Mapping[str, Any],
    ) -> Optional[Mapping[str, Any]]:
        return None

    def extract_state_update_types(
        self,
        paths: Sequence[str],
        **kwargs: Mapping[str, Any],
    ) -> Mapping[str, Optional[Mapping[str, Any]]]:
        return {}
