import json
from pathlib import Path
from typing import Optional, Union
from datetime import datetime

from qualibrate_api_base.api_bases import Snapshot as SnapshotBase
from qualibrate_api_base.api_bases import DocumentType, DocumentsSequence

from qualibrate.api.core.utils.path_utils import resolve_and_check_relative
from qualibrate.api.core.utils.find_utils import (
    get_subpath_value,
    get_subpath_value_on_any_depth,
)
from qualibrate.api.core.utils.common_utils import id_type_str
from qualibrate.api.models.snapshot_file import (
    SnapshotFile,
    SnapshotFileWithData,
)


class Snapshot(SnapshotBase):
    def __init__(self, base_path: Path):
        super().__init__()
        self.base_path = base_path

    @id_type_str
    def get(self, id: Union[str, int]) -> Optional[DocumentType]:
        file = resolve_and_check_relative(self.base_path, Path(str(id)))
        return SnapshotFileWithData(
            id=file.name,
            created_at=datetime.fromtimestamp(file.stat().st_ctime),
            modified_at=datetime.fromtimestamp(file.stat().st_mtime),
            data=json.loads(file.read_text()),
        ).model_dump()

    @id_type_str
    def search_data_values(
        self,
        id: Union[int, str],
        data_path: list[Union[str, int]],
    ) -> DocumentsSequence:
        file = resolve_and_check_relative(self.base_path, Path(str(id)))
        data = json.loads(file.read_text())
        return get_subpath_value(data, data_path)

    @id_type_str
    def search_data_values_any_depth(
        self,
        id: Union[int, str],
        target_key: str,
    ) -> DocumentsSequence:
        file = resolve_and_check_relative(self.base_path, Path(str(id)))
        data = json.loads(file.read_text())
        return get_subpath_value_on_any_depth(data, target_key)

    @id_type_str
    def get_history(self, id: Union[int, str]) -> DocumentsSequence:
        base_file = resolve_and_check_relative(self.base_path, Path(str(id)))
        file_m_ts = base_file.stat().st_mtime_ns
        files = list(
            filter(
                lambda item: (
                    item.is_file() and item.stat().st_mtime_ns <= file_m_ts
                ),
                self.base_path.iterdir(),
            )
        )
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
