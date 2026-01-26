import logging

from qualibrate.app.api.core.domain.local_storage.utils.node_utils import (
    find_nodes_ids_by_filter,
)
from qualibrate.app.api.core.schemas.update_history import UpdateHistoryRequired
from qualibrate.app.api.core.socket.periodic_tasks import repeat_every
from qualibrate.app.api.core.socket.ws_managers import (
    get_need_to_update_snapshots_history_socket_manager,
)
from qualibrate.app.api.core.types import IdType
from qualibrate.app.config import get_config_path, get_settings

__all__ = ["update_snapshot_history_required"]


def _on_exc(exc: Exception) -> None:
    logging.exception("Exception occurred while running periodic task", exc_info=exc)


previous_snapshot_id: IdType | None = None


@repeat_every(seconds=1, on_exception=_on_exc)
async def update_snapshot_history_required() -> None:
    manager = get_need_to_update_snapshots_history_socket_manager()
    if not manager.any_subscriber:
        return
    settings = get_settings(get_config_path())
    id = next(
        find_nodes_ids_by_filter(
            settings.storage.location,
            project_name=settings.project,
            descending=True,
        ),
        None,
    )
    global previous_snapshot_id
    update_required = UpdateHistoryRequired(
        latest_id=id,
        saved_id=previous_snapshot_id,
    )
    previous_snapshot_id = id
    await manager.broadcast(update_required.model_dump(mode="json"))
