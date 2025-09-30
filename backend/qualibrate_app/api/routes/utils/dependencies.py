from typing import Annotated

from fastapi import Depends, Query

from qualibrate_app.api.core.domain.bases.snapshot import (
    SnapshotLoadType,
    SnapshotLoadTypeFlag,
    SnapshotLoadTypeToLoadTypeFlag,
)
from qualibrate_app.api.routes.utils.snapshot_load_type import (
    parse_load_type_flag,
)


def get_snapshot_load_type_flag(
    load_type: Annotated[
        SnapshotLoadType | None, Query(deprecated="use load_type_flag")
    ] = None,
    load_type_flag: Annotated[
        SnapshotLoadTypeFlag, Depends(parse_load_type_flag)
    ] = SnapshotLoadTypeFlag.Metadata,
) -> SnapshotLoadTypeFlag:
    return (
        load_type_flag
        if load_type is None
        else SnapshotLoadTypeToLoadTypeFlag[load_type]
    )
