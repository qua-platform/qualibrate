from datetime import date
from typing import Annotated, Optional

from fastapi import Depends, Query

from qualibrate_app.api.core.domain.bases.snapshot import (
    SnapshotLoadType,
    SnapshotLoadTypeFlag,
    SnapshotLoadTypeToLoadTypeFlag,
)
from qualibrate_app.api.core.types import (
    IdType,
    PageFilter,
    SearchFilter,
    SearchWithIdFilter,
)
from qualibrate_app.api.routes.utils.snapshot_load_type import (
    parse_load_type_flag,
)


def get_page_filter(
    page: int = Query(1, gt=0),
    per_page: int = Query(50, gt=0),
) -> PageFilter:
    return PageFilter(page=page, per_page=per_page)


def get_search_filter(
    name_part: Annotated[Optional[str], Query()] = None,
    min_node_id: Annotated[IdType, Query()] = 1,
    max_node_id: Annotated[Optional[IdType], Query()] = None,
    min_date: Annotated[Optional[date], Query()] = None,
    max_date: Annotated[Optional[date], Query()] = None,
) -> SearchFilter:
    return SearchFilter(
        min_node_id=min_node_id,
        max_node_id=max_node_id,
        min_date=min_date,
        max_date=max_date,
        name_part=name_part,
    )


def get_search_with_id_filter(
    search_filter: Annotated[SearchFilter, Depends(get_search_filter)],
    id: Annotated[Optional[IdType], Query()] = None,
) -> SearchWithIdFilter:
    return SearchWithIdFilter(
        id=id,
        **search_filter.model_dump(),
    )


def get_snapshot_load_type_flag(
    load_type: Annotated[
        Optional[SnapshotLoadType], Query(deprecated="use load_type_flag")
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
