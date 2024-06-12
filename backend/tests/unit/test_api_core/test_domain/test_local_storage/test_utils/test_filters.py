from unittest.mock import PropertyMock

from qualibrate_app.api.core.domain.local_storage.utils import filters
from qualibrate_app.api.core.utils.path.node import NodePath
from qualibrate_app.api.core.utils.path.node_date import NodesDatePath


def test_date_less_or_eq():
    assert (
        filters.date_less_or_eq(NodesDatePath("2024-04-04"), "2024-04-04")
        is True
    )
    assert (
        filters.date_less_or_eq(NodesDatePath("2024-04-03"), "2024-04-04")
        is True
    )
    assert (
        filters.date_less_or_eq(NodesDatePath("2024-03-04"), "2024-04-04")
        is True
    )
    assert (
        filters.date_less_or_eq(NodesDatePath("2023-04-04"), "2024-04-04")
        is True
    )

    assert (
        filters.date_less_or_eq(NodesDatePath("2024-04-04"), "2024-04-03")
        is False
    )
    assert (
        filters.date_less_or_eq(NodesDatePath("2024-04-04"), "2024-03-04")
        is False
    )
    assert (
        filters.date_less_or_eq(NodesDatePath("2024-04-04"), "2023-04-04")
        is False
    )


def test_id_less_then_snapshot(mocker):
    filename = NodePath("#3_name")
    mocker.patch.object(
        NodePath, "id", new_callable=PropertyMock, return_value=3
    )
    assert filters.id_less_then_snapshot(filename, 4) is True
    assert filters.id_less_then_snapshot(filename, 3) is False
    assert filters.id_less_then_snapshot(filename, 2) is False
