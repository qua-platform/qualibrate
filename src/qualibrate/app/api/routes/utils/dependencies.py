from datetime import date
from typing import Annotated

from fastapi import Depends, Query

from qualibrate.app.api.core.domain.bases.snapshot import (
    SnapshotLoadType,
    SnapshotLoadTypeFlag,
    SnapshotLoadTypeToLoadTypeFlag,
)
from qualibrate.app.api.core.types import (
    IdType,
    PageFilter,
    SearchFilter,
    SearchWithIdFilter,
)
from qualibrate.app.api.routes.utils.snapshot_load_type import (
    parse_load_type_flag,
)


def get_page_filter(
    page: int = Query(
        1,
        gt=0,
        description="Page number (1-based).",
    ),
    per_page: int = Query(
        50,
        gt=0,
        description="Number of items per page.",
    ),
) -> PageFilter:
    return PageFilter(page=page, per_page=per_page)


def get_search_filter(
    name: Annotated[
        str | None,
        Query(description="Exact snapshot name to match."),
    ] = None,
    name_part: Annotated[
        str | None,
        Query(description="Substring to match within snapshot name."),
    ] = None,
    min_node_id: Annotated[
        IdType,
        Query(description="Lower bound (inclusive) for node ID range."),
    ] = 1,
    max_node_id: Annotated[
        IdType | None,
        Query(description="Upper bound (inclusive) for node ID range."),
    ] = None,
    min_date: Annotated[
        date | None,
        Query(description="Earliest snapshot date (inclusive)."),
    ] = None,
    max_date: Annotated[
        date | None,
        Query(description="Latest snapshot date (inclusive)."),
    ] = None,
    tag_name: Annotated[
        list[str] | None,
        Query(
            description=(
                "Filter by tag names. Snapshots must have ALL specified tags "
                "(AND logic). Can specify multiple: ?tag_name=t1&tag_name=t2"
            )
        ),
    ] = None,
) -> SearchFilter:
    return SearchFilter(
        name=name,
        name_part=name_part,
        min_node_id=min_node_id,
        max_node_id=max_node_id,
        min_date=min_date,
        max_date=max_date,
        tags=tag_name,
    )


def get_search_with_id_filter(
    search_filter: Annotated[SearchFilter, Depends(get_search_filter)],
    id: Annotated[
        IdType | None,
        Query(
            description=(
                "Exact snapshot ID to match (overrides name/date filters "
                "if set)."
            )
        ),
    ] = None,
) -> SearchWithIdFilter:
    return SearchWithIdFilter(
        id=id,
        **search_filter.model_dump(),
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
