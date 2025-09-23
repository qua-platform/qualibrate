import logging

from qualibrate_runner.api.dependencies import get_state
from qualibrate_runner.core.app.periodic_tasks import repeat_every
from qualibrate_runner.core.app.ws_managers import (
    get_execution_history_socket_manager,
    get_run_status_socket_manager,
)
from qualibrate_runner.core.statuses import (
    get_graph_execution_history,
    get_run_status,
)

__all__ = ["run_status", "execution_history"]


def _on_exc(exc: Exception) -> None:
    logging.exception(
        "Exception occurred while running periodic task", exc_info=exc
    )


@repeat_every(seconds=1, on_exception=_on_exc)
async def run_status() -> None:
    manager = get_run_status_socket_manager()
    if not manager.any_subscriber:
        return
    status = get_run_status(get_state())
    await manager.broadcast(status.model_dump(mode="json"))


@repeat_every(seconds=1, on_exception=_on_exc)
async def execution_history() -> None:
    manager = get_execution_history_socket_manager()
    if not manager.any_subscriber:
        return
    history = get_graph_execution_history(get_state())
    if history is None:
        await manager.broadcast(True, None)
        await manager.broadcast(False, None)
        return
    await manager.broadcast(False, history.model_dump(mode="json"))
    reversed_items = list(reversed(history.items))
    history_reversed = history.model_copy(update={"items": reversed_items})
    await manager.broadcast(True, history_reversed.model_dump(mode="json"))
