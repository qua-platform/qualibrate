import json
from datetime import datetime
from pathlib import Path
from typing import Union

from qualibrate_api_base.api_bases import (
    Branch,
    Snapshot,
    Root,
    DocumentType,
    DocumentsSequence,
)

from qualibrate.api.core.utils.find_utils import get_subpath_value
from qualibrate.api.models.snapshot_file import (
    SnapshotFileWithData,
    SnapshotFile,
)


class Timeline(Branch):
    def __init__(self, base_path: Path):
        super().__init__()
        self.base_path = base_path

    def get_base_collection(self) -> Root:
        return self

    def get_last_snapshot(self, branch_name: str) -> DocumentType:
        """
        Return last modified file from directory.
        Branch name arg has no effect.
        """
        list_of_files = filter(Path.is_file, self.base_path.iterdir())
        latest_file = max(list_of_files, key=lambda x: x.stat().st_mtime)
        snapshot = SnapshotFileWithData(
            id=latest_file.name,
            created_at=datetime.fromtimestamp(latest_file.stat().st_ctime),
            modified_at=datetime.fromtimestamp(latest_file.stat().st_mtime),
            data=json.loads(latest_file.read_text()),
        )
        return snapshot.model_dump()

    def search_data_values(
        self,
        branch_name: str,
        data_path: list[Union[str, int]],
        snapshot_api: Snapshot,
    ) -> DocumentsSequence:
        files = list(filter(Path.is_file, self.base_path.iterdir()))
        sorted_files = sorted(
            files, key=lambda item: item.stat().st_mtime_ns, reverse=True
        )
        values = []
        for file in sorted_files:
            try:
                with file.open() as f:
                    data = json.load(f)
            except json.JSONDecodeError:
                continue
            values.append(
                {
                    "id": file.name,
                    "values": get_subpath_value(data, data_path),
                }
            )
        return values

    def get_history(
        self, branch_name: str, snapshot_api: Snapshot
    ) -> DocumentsSequence:
        files = list(filter(Path.is_file, self.base_path.iterdir()))
        sorted_files = sorted(
            files, key=lambda item: item.stat().st_mtime_ns, reverse=True
        )
        return [
            SnapshotFile(
                id=file.name,
                created_at=datetime.fromtimestamp(file.stat().st_ctime),
                modified_at=datetime.fromtimestamp(file.stat().st_mtime),
            ).model_dump()
            for file in sorted_files
        ]
