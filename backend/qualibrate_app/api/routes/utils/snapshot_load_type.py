import operator
import sys
from functools import reduce
from typing import Annotated

from fastapi import HTTPException, Query

from qualibrate_app.api.core.domain.bases.snapshot import SnapshotLoadTypeFlag

if sys.version_info >= (3, 11):
    from enum import StrEnum
else:
    from enum import Enum

    class StrEnum(str, Enum):
        pass


__all__ = ["SnapshotLoadTypeStr", "parse_load_type_flag"]


class SnapshotLoadTypeStr(StrEnum):
    Minified = "Minified"
    Metadata = "Metadata"
    DataWithoutRefs = "DataWithoutRefs"
    DataWithMachine = "DataWithMachine"
    DataWithResults = "DataWithResults"
    DataWithResultsWithImgs = "DataWithResultsWithImgs"
    Full = "Full"


def _parse_snapshot_load_type(
    name: SnapshotLoadTypeStr,
) -> SnapshotLoadTypeFlag:
    try:
        return SnapshotLoadTypeFlag[name]
    except KeyError:
        raise HTTPException(
            status_code=400, detail=f"Invalid load type '{name}'"
        ) from None


def parse_load_type_flag(
    load_type_flag: Annotated[list[SnapshotLoadTypeStr] | None, Query()] = None,
) -> SnapshotLoadTypeFlag:
    if load_type_flag is None:
        return SnapshotLoadTypeFlag.Minified
    load_types = [_parse_snapshot_load_type(t) for t in load_type_flag]
    return reduce(
        operator.or_,
        load_types,
        SnapshotLoadTypeFlag.Minified,
    )
