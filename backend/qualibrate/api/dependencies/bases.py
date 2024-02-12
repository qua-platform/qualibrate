from typing import Annotated

from fastapi import Depends

from qualibrate.api.core.snapshot import Snapshot
from qualibrate.api.core.timeline import Timeline
from qualibrate.config import QualibrateSettings, get_settings


def get_snapshot_actions(
    settings: Annotated[QualibrateSettings, Depends(get_settings)],
) -> Snapshot:
    return Snapshot(settings.user_storage)


def get_timeline_actions(
    settings: Annotated[QualibrateSettings, Depends(get_settings)],
) -> Timeline:
    return Timeline(settings.user_storage)
