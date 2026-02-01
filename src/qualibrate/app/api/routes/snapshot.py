import contextlib
from collections.abc import Mapping, Sequence
from typing import Annotated, Any, cast
from urllib.parse import urljoin

import requests
from fastapi import APIRouter, Body, Cookie, Depends, HTTPException, Path, Query
from qualibrate_config.models import QualibrateConfig, StorageType

from qualibrate.app.api.core.domain.bases.snapshot import (
    SnapshotBase,
    SnapshotLoadTypeFlag,
)
from qualibrate.app.api.core.domain.local_storage.snapshot import (
    SnapshotLocalStorage,
    logger,
)
from qualibrate.app.api.core.domain.timeline_db.snapshot import (
    SnapshotTimelineDb,
)
from qualibrate.app.api.core.domain.local_storage.tag_registry import TagRegistry
from qualibrate.app.api.core.models.paged import PagedCollection
from qualibrate.app.api.core.models.snapshot import (
    MachineSearchResults,
    SimplifiedSnapshotWithMetadata,
)
from qualibrate.app.api.core.models.snapshot import Snapshot as SnapshotModel
from qualibrate.app.api.core.schemas.state_updates import (
    StateUpdateRequestItems,
)
from qualibrate.app.api.core.schemas.comment import (
    Comment,
    CommentCreateRequest,
    CommentRemoveRequest,
    CommentUpdateRequest,
)
from qualibrate.app.api.core.schemas.tag import TagNameRequest, TagsAssignRequest
from qualibrate.app.api.core.types import (
    IdType,
    PageFilter,
)
from qualibrate.app.api.core.utils.request_utils import get_runner_config
from qualibrate.app.api.core.utils.types_parsing import types_conversion
from qualibrate.app.api.dependencies.search import get_search_path
from qualibrate.app.api.routes.utils.dependencies import (
    get_page_filter,
    get_snapshot_load_type_flag,
)
from qualibrate.app.config import (
    get_settings,
)

snapshot_router = APIRouter(prefix="/snapshot/{id}", tags=["snapshot"])


def _get_snapshot_instance(
    id: Annotated[IdType, Path()],
    settings: Annotated[QualibrateConfig, Depends(get_settings)],
) -> SnapshotBase:
    snapshot_types: dict[StorageType, type[SnapshotBase]] = {
        StorageType.local_storage: SnapshotLocalStorage,
        StorageType.timeline_db: SnapshotTimelineDb,
    }
    return snapshot_types[settings.storage.type](id=id, settings=settings)


@snapshot_router.get("/")
def get(
    *,
    load_type_flag: Annotated[
        SnapshotLoadTypeFlag, Depends(get_snapshot_load_type_flag)
    ],
    snapshot: Annotated[SnapshotBase, Depends(_get_snapshot_instance)],
) -> SnapshotModel:
    snapshot.load_from_flag(load_type_flag)
    return snapshot.dump()


@snapshot_router.get("/history")
def get_history(
    *,
    page_filter: Annotated[PageFilter, Depends(get_page_filter)],
    descending: bool = True,
    reverse: Annotated[
        bool,
        Query(
            deprecated=True,
            description="This field is ignored. Use `descending` instead.",
        ),
    ] = False,
    global_reverse: Annotated[
        bool,
        Query(
            deprecated=True,
            description="This field is ignored. Use `descending` instead.",
        ),
    ] = False,
    snapshot: Annotated[SnapshotBase, Depends(_get_snapshot_instance)],
) -> PagedCollection[SimplifiedSnapshotWithMetadata]:
    total, history = snapshot.get_latest_snapshots(
        pages_filter=page_filter,
        descending=descending,
    )
    history_dumped = [
        SimplifiedSnapshotWithMetadata(**snapshot.dump().model_dump())
        for snapshot in history
    ]
    return PagedCollection[SimplifiedSnapshotWithMetadata](
        page=page_filter.page,
        per_page=page_filter.per_page,
        total_items=total,
        items=history_dumped,
    )


@snapshot_router.get("/compare")
def compare_by_id(
    id_to_compare: IdType,
    snapshot: Annotated[SnapshotBase, Depends(_get_snapshot_instance)],
) -> Mapping[str, Mapping[str, Any]]:
    return snapshot.compare_by_id(id_to_compare)


@snapshot_router.post("/update_entry")
def update_entry(
    *,
    snapshot: Annotated[SnapshotBase, Depends(_get_snapshot_instance)],
    data_path: Annotated[
        str,
        Body(
            ...,
            min_length=3,
            pattern="^#/.*",
            examples=["#/qubits/q0/frequency"],
        ),
    ],
    value: Annotated[Any, Body()],
    settings: Annotated[QualibrateConfig, Depends(get_settings)],
    qualibrate_token: Annotated[
        str | None, Cookie(alias="Qualibrate-Token")
    ] = None,
) -> bool:
    cookies = (
        {"Qualibrate-Token": qualibrate_token}
        if qualibrate_token is not None
        else {}
    )
    type_ = snapshot.extract_state_update_type(data_path, cookies=cookies)
    if type_ is not None:
        value = types_conversion(value, type_)
    updated = snapshot.update_entry({data_path: value})
    if updated:
        try:
            runner_config = get_runner_config(settings)
        except RuntimeError as ex:
            logger.exception(str(ex))
            return False
        with contextlib.suppress(requests.exceptions.ConnectionError):
            requests.post(
                urljoin(runner_config.address_with_root, "record_state_update"),
                params={"key": data_path},
                cookies=cookies,
                timeout=runner_config.timeout,
            )
    return updated


@snapshot_router.post("/update_entries")
def update_entries(
    *,
    snapshot: Annotated[SnapshotBase, Depends(_get_snapshot_instance)],
    state_updates: StateUpdateRequestItems,
    settings: Annotated[QualibrateConfig, Depends(get_settings)],
    qualibrate_token: Annotated[
        str | None, Cookie(alias="Qualibrate-Token")
    ] = None,
) -> bool:
    """
    Updates entries in a snapshot based on provided state updates.

    This endpoint extracts state update types for the provided paths and
    converts the update values according to the extracted types. It then applies
    the updates to the snapshot. If the update is successful, it attempts to
    record the state updates with the runner.
    """
    cookies = (
        {"Qualibrate-Token": qualibrate_token}
        if qualibrate_token is not None
        else {}
    )
    types = snapshot.extract_state_update_types(
        [item.data_path for item in state_updates.items], cookies=cookies
    )
    values = {
        item.data_path: types_conversion(
            item.value, cast(Mapping[str, Any], types[item.data_path])
        )
        for item in state_updates.items
        if types.get(item.data_path) is not None
    }
    updated = snapshot.update_entry(values)
    if updated:
        try:
            runner_config = get_runner_config(settings)
        except RuntimeError as ex:
            logger.exception(str(ex))
            return False
        for data_path in values:
            with contextlib.suppress(requests.exceptions.ConnectionError):
                requests.post(
                    urljoin(
                        runner_config.address_with_root, "record_state_update"
                    ),
                    params={"key": data_path},
                    cookies=cookies,
                    timeout=runner_config.timeout,
                )
    return updated


@snapshot_router.get("/search/data/values")
def search(
    snapshot: Annotated[SnapshotBase, Depends(_get_snapshot_instance)],
    data_path: Annotated[list[str | int], Depends(get_search_path)],
) -> Sequence[MachineSearchResults] | None:
    return snapshot.search(data_path, load=True)


@snapshot_router.get(
    "/search/data/value/any_depth",
    summary="Find a key anywhere in the snapshot structure",
)
def search_recursive(
    snapshot: Annotated[SnapshotBase, Depends(_get_snapshot_instance)],
    target_key: Annotated[
        str,
        Query(
            description=(
                "The key name to search for (e.g., 'amplitude', "
                "'frequency', 'length'). Searches the entire JSON "
                "structure at any depth."
            )
        ),
    ],
) -> Sequence[MachineSearchResults] | None:
    """
    Search for a key name anywhere in the snapshot structure without knowing
    the full path.

    Use this when you know the parameter name (e.g., 'amplitude',
    'frequency') but don't know where it appears in the nested JSON
    structure. The search recursively traverses all levels and returns every
    location where the key is found.

    **Use cases:**
    - Find all occurrences of a parameter name across the entire structure
    - Discover how many times a parameter appears (e.g., amplitude in x180,
      x90, gates)
    - Explore unfamiliar snapshot structures without knowing exact paths

    ### Example: Find all "amplitude" parameters

    **Request:**
    `/api/snapshot/977/search/data/value/any_depth?target_key=amplitude`

    **Response (abbreviated):**
    ```json
    [
      {
          "key": [
              "qubits", "q6_10", "xy", "operations",
              "x180_DragCosine", "amplitude"
          ],
          "value": 0.475
      },
      {
          "key": [
              "qubits", "q6_10", "xy", "operations",
              "x90_DragCosine", "amplitude"
          ],
          "value": 0.237
      },
      {
          "key": [
              "qubits", "q6_10", "xy", "operations",
              "-x90_DragCosine", "amplitude"
          ],
          "value": "#../x90_DragCosine/amplitude"
      }
      // ... and 325 more results
    ]
    ```

    Returns: All 328 occurrences of the "amplitude" key throughout the
    entire snapshot structure.
    """
    return snapshot.search_recursive(target_key, load=True)


# --- Tag Management Endpoints ---


def _get_tag_registry(
    settings: Annotated[QualibrateConfig, Depends(get_settings)],
) -> TagRegistry:
    """Get the tag registry instance for the current project."""
    return TagRegistry(settings=settings)


@snapshot_router.get(
    "/tags",
    summary="Get tags assigned to this snapshot",
    response_model=list[str],
)
def get_snapshot_tags(
    snapshot: Annotated[SnapshotBase, Depends(_get_snapshot_instance)],
) -> list[str]:
    """
    Get the list of tags assigned to this snapshot.

    ### Example

    **Request:** `GET /api/snapshot/123/tags`

    **Response:**
    ```json
    ["calibration", "rabi", "benchmarking"]
    ```
    """
    return snapshot.get_tags()


@snapshot_router.post(
    "/tags",
    summary="Assign tags to this snapshot",
    response_model=bool,
)
def assign_snapshot_tags(
    snapshot: Annotated[SnapshotBase, Depends(_get_snapshot_instance)],
    request: Annotated[TagsAssignRequest, Body()],
    tag_registry: Annotated[TagRegistry, Depends(_get_tag_registry)],
) -> bool:
    """
    Assign tags to this snapshot.

    This replaces any existing tags with the provided list.
    Any tags that don't exist in the global registry will be auto-created.

    ### Example

    **Request:**
    ```json
    {"tags": ["calibration", "rabi", "quick-check"]}
    ```

    **Response:** `true` or `false`
    """
    # Ensure all tags exist in the global registry
    tag_registry.ensure_tags_exist(request.tags)

    return snapshot.set_tags(request.tags)


@snapshot_router.post(
    "/tag/remove",
    summary="Remove a tag from this snapshot",
    response_model=bool,
)
def remove_snapshot_tag(
    snapshot: Annotated[SnapshotBase, Depends(_get_snapshot_instance)],
    request: Annotated[TagNameRequest, Body()],
) -> bool:
    """
    Remove a specific tag from this snapshot.

    If the tag is not assigned to this snapshot, returns True.

    ### Example

    **Request:**
    ```json
    {"name": "calibration"}
    ```

    **Response:** `true` or `false`
    """
    return snapshot.remove_tag(request.name)


# --- Comment Management Endpoints ---


@snapshot_router.post(
    "/comment/create",
    summary="Create a new comment for this snapshot",
    response_model=Comment,
    responses={
        200: {"description": "Comment created successfully"},
        400: {"description": "Invalid comment value or creation failed"},
    },
)
def create_comment(
    snapshot: Annotated[SnapshotBase, Depends(_get_snapshot_instance)],
    request: Annotated[CommentCreateRequest, Body()],
) -> Comment:
    """
    Create a new comment for this snapshot.

    ### Example

    **Request:**
    ```json
    {"value": "Some random comment"}
    ```

    **Response:**
    ```json
    {
      "id": 1,
      "value": "Some random comment",
      "createdAt": "2026-01-27T10:00:00+00:00"
    }
    ```
    """
    comment = snapshot.create_comment(request.value)
    if comment is None:
        raise HTTPException(
            status_code=400,
            detail="Failed to create comment. Please check the comment value.",
        )
    return Comment(
        id=comment["id"],
        value=comment["value"],
        createdAt=comment["created_at"],
    )


@snapshot_router.post(
    "/comment/update",
    summary="Update an existing comment",
    response_model=bool,
    responses={
        200: {"description": "Comment updated successfully"},
        404: {"description": "Comment not found"},
    },
)
def update_comment(
    snapshot: Annotated[SnapshotBase, Depends(_get_snapshot_instance)],
    request: Annotated[CommentUpdateRequest, Body()],
) -> bool:
    """
    Update an existing comment for this snapshot.

    ### Example

    **Request:**
    ```json
    {
      "id": 1,
      "value": "Some random comment UPDATED"
    }
    ```

    **Response:** `true` or `false`
    """
    result = snapshot.update_comment(request.id, request.value)
    if not result:
        raise HTTPException(
            status_code=404,
            detail=f"Comment with id {request.id} not found or update failed.",
        )
    return result


@snapshot_router.get(
    "/comments",
    summary="Get all comments for this snapshot",
    response_model=list[Comment],
)
def get_comments(
    snapshot: Annotated[SnapshotBase, Depends(_get_snapshot_instance)],
) -> list[Comment]:
    """
    Get all comments for this snapshot.

    ### Example

    **Request:** `GET /api/snapshot/123/comments`

    **Response:**
    ```json
    [
      {
        "id": 1,
        "value": "Some random comment",
        "createdAt": "2026-01-27T10:00:00+00:00"
      },
      {
        "id": 2,
        "value": "Some random comment 2",
        "createdAt": "2026-01-27T11:00:00+00:00"
      }
    ]
    ```
    """
    comments = snapshot.get_comments()
    return [
        Comment(
            id=c["id"],
            value=c["value"],
            createdAt=c["created_at"],
        )
        for c in comments
    ]


@snapshot_router.post(
    "/comment/remove",
    summary="Remove a comment from this snapshot",
    response_model=bool,
)
def remove_comment(
    snapshot: Annotated[SnapshotBase, Depends(_get_snapshot_instance)],
    request: Annotated[CommentRemoveRequest, Body()],
) -> bool:
    """
    Remove a specific comment from this snapshot.

    If the comment does not exist, returns True (idempotent behavior).

    ### Example

    **Request:**
    ```json
    {"id": 13}
    ```

    **Response:** `true` or `false`
    """
    return snapshot.remove_comment(request.id)
