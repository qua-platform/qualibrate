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

__all__ = ["update_snapshot_history_required", "SnapshotHistoryBroadcaster"]


def _on_exc(exc: Exception) -> None:
    logging.exception("Exception occurred while running periodic task", exc_info=exc)


class SnapshotHistoryBroadcaster:
    """Broadcasts snapshot history updates to WebSocket subscribers.

    This class encapsulates the state tracking for snapshot history updates,
    avoiding the use of global variables.
    """

    def __init__(self) -> None:
        self._previous_snapshot_id: IdType | None = None

    async def broadcast_if_changed(self) -> None:
        """Check for new snapshots and broadcast update to subscribers."""
        manager = get_need_to_update_snapshots_history_socket_manager()
        if not manager.any_subscriber:
            return
        settings = get_settings(get_config_path())
        snapshot_id = next(
            find_nodes_ids_by_filter(
                settings.storage.location,
                project_name=settings.project,
                descending=True,
            ),
            None,
        )
        update_required = UpdateHistoryRequired(
            latest_id=snapshot_id,
            saved_id=self._previous_snapshot_id,
        )
        self._previous_snapshot_id = snapshot_id
        await manager.broadcast(update_required.model_dump(mode="json"))

    def reset(self) -> None:
        """Reset the tracked snapshot ID state."""
        self._previous_snapshot_id = None


_broadcaster = SnapshotHistoryBroadcaster()


@repeat_every(seconds=1, on_exception=_on_exc)
async def update_snapshot_history_required() -> None:
    await _broadcaster.broadcast_if_changed()
