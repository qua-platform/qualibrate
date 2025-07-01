import contextlib
from collections.abc import Mapping
from typing import Annotated, Any, Optional, Union, cast
from urllib.parse import urljoin

import requests
from fastapi import APIRouter, Body, Cookie, Depends, Path, Query
from qualibrate_config.models import QualibrateConfig, StorageType

from qualibrate_app.api.core.domain.bases.snapshot import (
    SnapshotBase,
    SnapshotLoadTypeFlag,
)
from qualibrate_app.api.core.domain.local_storage.snapshot import (
    SnapshotLocalStorage,
    logger,
)
from qualibrate_app.api.core.domain.timeline_db.snapshot import (
    SnapshotTimelineDb,
)
from qualibrate_app.api.core.models.paged import PagedCollection
from qualibrate_app.api.core.models.snapshot import (
    SimplifiedSnapshotWithMetadata,
)
from qualibrate_app.api.core.models.snapshot import Snapshot as SnapshotModel
from qualibrate_app.api.core.schemas.state_updates import (
    StateUpdateRequestItems,
)
from qualibrate_app.api.core.types import DocumentSequenceType, IdType
from qualibrate_app.api.core.utils.request_utils import get_runner_config
from qualibrate_app.api.core.utils.types_parsing import types_conversion
from qualibrate_app.api.dependencies.search import get_search_path
from qualibrate_app.api.routes.utils.dependencies import (
    get_snapshot_load_type_flag,
)
from qualibrate_app.config import (
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
    page: int = Query(1, gt=0),
    per_page: int = Query(50, gt=0),
    reverse: bool = False,
    global_reverse: bool = False,
    snapshot: Annotated[SnapshotBase, Depends(_get_snapshot_instance)],
) -> PagedCollection[SimplifiedSnapshotWithMetadata]:
    total, history = snapshot.get_latest_snapshots(
        page, per_page, global_reverse
    )
    history_dumped = [
        SimplifiedSnapshotWithMetadata(**snapshot.dump().model_dump())
        for snapshot in history
    ]
    if reverse:
        # TODO: make more correct relationship update
        history_dumped = list(reversed(history_dumped))
    return PagedCollection[SimplifiedSnapshotWithMetadata](
        page=page, per_page=per_page, total_items=total, items=history_dumped
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
        Union[str, None], Cookie(alias="Qualibrate-Token")
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
        Union[str, None], Cookie(alias="Qualibrate-Token")
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
    data_path: Annotated[list[Union[str, int]], Depends(get_search_path)],
) -> Optional[DocumentSequenceType]:
    return snapshot.search(data_path, load=True)


@snapshot_router.get("/search/data/value/any_depth")
def search_recursive(
    snapshot: Annotated[SnapshotBase, Depends(_get_snapshot_instance)],
    target_key: str,
) -> Optional[DocumentSequenceType]:
    return snapshot.search_recursive(target_key, load=True)
