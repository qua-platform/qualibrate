from datetime import datetime

import pytest

import tests.api.local_storage._utils as _utils_test
from qualibrate_app.api.routes.utils.snapshot_load_type import (
    SnapshotLoadTypeStr,
)


@pytest.mark.parametrize("load_type", (0, 1))
def test_root_get_branch_load_type(
    client_custom_settings, default_local_storage_project, load_type
):
    response = client_custom_settings.get(
        "/api/root/branch",
        params={"branch_name": "main", "load_type": load_type},
    )
    assert response.status_code == 200
    created_at = datetime.fromtimestamp(
        default_local_storage_project.stat().st_mtime
    ).astimezone()
    assert response.json() == {
        "created_at": created_at.isoformat(timespec="seconds"),
        "id": 1,
        "name": "main",
        "snapshot_id": -1,
    }


def test_root_get_branch_default(
    client_custom_settings, default_local_storage_project
):
    response = client_custom_settings.get("/api/root/branch")
    assert response.status_code == 200
    created_at = datetime.fromtimestamp(
        default_local_storage_project.stat().st_mtime
    ).astimezone()
    assert response.json() == {
        "created_at": created_at.isoformat(timespec="seconds"),
        "id": 1,
        "name": "main",
        "snapshot_id": -1,
    }


def test_root_get_snapshot_default(
    client_custom_settings, default_local_storage_project, snapshots_history
):
    snapshot_id = 3
    response = client_custom_settings.get(
        "/api/root/snapshot", params={"id": snapshot_id}
    )
    snapshot = snapshots_history[len(snapshots_history) - snapshot_id]
    snapshot = _utils_test.update_snapshot_minified_response(snapshot)
    assert response.status_code == 200
    assert response.json() == snapshot


@pytest.mark.parametrize(
    "load_type, to_update",
    (
        (
            1,
            {
                "metadata": _utils_test.EMPTY_METADATA,
                "data": None,
            },
        ),
        (2, {"data": None}),
        (
            3,
            {
                "data": {
                    "quam": {"quam": {"node": 3}, "info": "snapshot"},
                    "machine": {"quam": {"node": 3}, "info": "snapshot"},
                    "parameters": None,
                    "outcomes": None,
                    "results": {
                        "info": "out data",
                        "result": "node_3",
                    },
                }
            },
        ),
        (
            4,
            {
                "data": {
                    "quam": {"quam": {"node": 3}, "info": "snapshot"},
                    "machine": {"quam": {"node": 3}, "info": "snapshot"},
                    "parameters": None,
                    "outcomes": None,
                    "results": {
                        "info": "out data",
                        "result": "node_3",
                    },
                }
            },
        ),
    ),
)
def test_root_get_snapshot_load_type(
    client_custom_settings,
    default_local_storage_project,
    snapshots_history,
    load_type,
    to_update,
):
    snapshot_id = 3
    response = client_custom_settings.get(
        "/api/root/snapshot",
        params={"id": 3, "load_type": load_type},
    )
    snapshot = snapshots_history[len(snapshots_history) - snapshot_id]
    snapshot.update(to_update)
    assert response.status_code == 200
    assert response.json() == snapshot


@pytest.mark.parametrize(
    "load_type_flag, to_update",
    (
        (
            SnapshotLoadTypeStr.Minified,
            {
                "metadata": _utils_test.EMPTY_METADATA,
                "data": None,
            },
        ),
        (SnapshotLoadTypeStr.Metadata, {"data": None}),
        (
            SnapshotLoadTypeStr.DataWithoutRefs,
            {
                "metadata": _utils_test.EMPTY_METADATA,
                "data": {
                    "quam": None,
                    "machine": None,
                    "parameters": None,
                    "outcomes": None,
                    "results": None,
                },
            },
        ),
        (
            SnapshotLoadTypeStr.DataWithMachine,
            {
                "metadata": _utils_test.EMPTY_METADATA,
                "data": {
                    "quam": {"quam": {"node": 3}, "info": "snapshot"},
                    "machine": {"quam": {"node": 3}, "info": "snapshot"},
                    "parameters": None,
                    "outcomes": None,
                    "results": None,
                },
            },
        ),
        (
            SnapshotLoadTypeStr.DataWithResults,
            {
                "metadata": _utils_test.EMPTY_METADATA,
                "data": {
                    "quam": None,
                    "machine": None,
                    "parameters": None,
                    "outcomes": None,
                    "results": {
                        "info": "out data",
                        "result": "node_3",
                    },
                },
            },
        ),
        (
            SnapshotLoadTypeStr.Full,
            {
                "data": {
                    "quam": {"quam": {"node": 3}, "info": "snapshot"},
                    "machine": {"quam": {"node": 3}, "info": "snapshot"},
                    "parameters": None,
                    "outcomes": None,
                    "results": {
                        "info": "out data",
                        "result": "node_3",
                    },
                }
            },
        ),
    ),
)
def test_root_get_snapshot_load_type_flag(
    client_custom_settings,
    default_local_storage_project,
    snapshots_history,
    load_type_flag,
    to_update,
):
    snapshot_id = 3
    response = client_custom_settings.get(
        "/api/root/snapshot",
        params={"id": 3, "load_type_flag": load_type_flag.value},
    )
    snapshot = snapshots_history[len(snapshots_history) - snapshot_id]
    snapshot.update(to_update)
    assert response.status_code == 200
    assert response.json() == snapshot


def test_root_get_latest_snapshot_default(
    client_custom_settings, default_local_storage_project, snapshots_history
):
    response = client_custom_settings.get("/api/root/snapshot/latest")
    snapshot = snapshots_history[0]
    snapshot = _utils_test.update_snapshot_minified_response(snapshot)
    assert response.status_code == 200
    assert response.json() == snapshot


@pytest.mark.parametrize(
    "load_type, to_update",
    (
        (
            1,
            {
                "metadata": _utils_test.EMPTY_METADATA,
                "data": None,
            },
        ),
        (2, {"data": None}),
        (
            3,
            {
                "data": {
                    "quam": {"quam": {"node": 9}, "info": "snapshot"},
                    "machine": {"quam": {"node": 9}, "info": "snapshot"},
                    "parameters": None,
                    "outcomes": None,
                    "results": {
                        "info": "out data",
                        "result": "node_9",
                    },
                }
            },
        ),
        (
            4,
            {
                "data": {
                    "quam": {"quam": {"node": 9}, "info": "snapshot"},
                    "machine": {"quam": {"node": 9}, "info": "snapshot"},
                    "parameters": None,
                    "outcomes": None,
                    "results": {
                        "info": "out data",
                        "result": "node_9",
                    },
                }
            },
        ),
    ),
)
def test_root_get_latest_snapshot_load_type(
    client_custom_settings,
    default_local_storage_project,
    snapshots_history,
    load_type,
    to_update,
):
    response = client_custom_settings.get(
        "/api/root/snapshot/latest", params={"load_type": load_type}
    )
    snapshot = snapshots_history[0]
    snapshot.update(to_update)
    assert response.status_code == 200
    assert response.json() == snapshot


@pytest.mark.parametrize(
    "load_type_flag, to_update",
    (
        (
            SnapshotLoadTypeStr.Minified,
            {
                "metadata": _utils_test.EMPTY_METADATA,
                "data": None,
            },
        ),
        (SnapshotLoadTypeStr.Metadata, {"data": None}),
        (
            SnapshotLoadTypeStr.DataWithoutRefs,
            {
                "metadata": _utils_test.EMPTY_METADATA,
                "data": {
                    "quam": None,
                    "machine": None,
                    "parameters": None,
                    "outcomes": None,
                    "results": None,
                },
            },
        ),
        (
            SnapshotLoadTypeStr.DataWithMachine,
            {
                "metadata": _utils_test.EMPTY_METADATA,
                "data": {
                    "quam": {"quam": {"node": 9}, "info": "snapshot"},
                    "machine": {"quam": {"node": 9}, "info": "snapshot"},
                    "parameters": None,
                    "outcomes": None,
                    "results": None,
                },
            },
        ),
        (
            SnapshotLoadTypeStr.DataWithResults,
            {
                "metadata": _utils_test.EMPTY_METADATA,
                "data": {
                    "quam": None,
                    "machine": None,
                    "parameters": None,
                    "outcomes": None,
                    "results": {
                        "info": "out data",
                        "result": "node_9",
                    },
                },
            },
        ),
        (
            SnapshotLoadTypeStr.Full,
            {
                "data": {
                    "quam": {"quam": {"node": 9}, "info": "snapshot"},
                    "machine": {"quam": {"node": 9}, "info": "snapshot"},
                    "parameters": None,
                    "outcomes": None,
                    "results": {
                        "info": "out data",
                        "result": "node_9",
                    },
                }
            },
        ),
    ),
)
def test_root_get_latest_snapshot_load_type_flag(
    client_custom_settings,
    default_local_storage_project,
    snapshots_history,
    load_type_flag,
    to_update,
):
    response = client_custom_settings.get(
        "/api/root/snapshot/latest",
        params={"load_type_flag": load_type_flag.value},
    )
    snapshot = snapshots_history[0]
    snapshot.update(to_update)
    assert response.status_code == 200
    assert response.json() == snapshot


def test_root_get_node_default(
    client_custom_settings,
    default_local_storage_project,
    snapshots_history,
    dfss_history,
):
    node_id = 3
    response = client_custom_settings.get(
        "/api/root/node", params={"id": node_id}
    )
    snapshot = snapshots_history[len(dfss_history) - node_id]
    dfs = dfss_history[len(dfss_history) - node_id]
    assert response.status_code == 200
    assert response.json() == {
        "id": 3,
        "snapshot": snapshot,
        "storage": dfs,
    }


@pytest.mark.parametrize("load_type, dfs", ((1, False), (2, True)))
def test_root_get_node_load_type(
    client_custom_settings,
    default_local_storage_project,
    snapshots_history,
    dfss_history,
    load_type,
    dfs,
):
    node_id = 3
    response = client_custom_settings.get(
        "/api/root/node",
        params={"id": node_id, "load_type": load_type},
    )
    snapshot = snapshots_history[len(snapshots_history) - node_id]
    dfs_value = dfss_history[len(dfss_history) - node_id] if dfs else None
    assert response.status_code == 200
    assert response.json() == {
        "id": 3,
        "snapshot": snapshot,
        "storage": dfs_value,
    }


def test_root_get_latest_node_default(
    client_custom_settings,
    default_local_storage_project,
    snapshots_history,
    dfss_history,
):
    response = client_custom_settings.get("/api/root/node/latest")
    assert response.status_code == 200
    assert response.json() == {
        "id": 9,
        "snapshot": snapshots_history[0],
        "storage": dfss_history[0],
    }


@pytest.mark.parametrize("load_type, dfs", ((1, False), (2, True)))
def test_root_get_latest_node_load_type(
    client_custom_settings,
    default_local_storage_project,
    snapshots_history,
    dfss_history,
    load_type,
    dfs,
):
    response = client_custom_settings.get(
        "/api/root/node/latest", params={"load_type": load_type}
    )
    assert response.status_code == 200
    assert response.json() == {
        "id": 9,
        "snapshot": snapshots_history[0],
        "storage": dfss_history[0] if dfs else None,
    }


def test_root_snapshots_history_default(
    client_custom_settings, snapshots_history
):
    response = client_custom_settings.get("/api/root/snapshots_history")
    assert response.status_code == 200
    assert response.json() == {
        "page": 1,
        "per_page": 50,
        "total_items": 9,
        "total_pages": 1,
        "items": snapshots_history,
    }


def test_root_snapshots_history_reverse(
    client_custom_settings, snapshots_history
):
    response = client_custom_settings.get(
        "/api/root/snapshots_history", params={"reverse": True}
    )
    assert response.status_code == 200
    assert response.json() == {
        "page": 1,
        "per_page": 50,
        "total_items": 9,
        "total_pages": 1,
        "items": snapshots_history[::-1],
    }


def test_root_snapshots_history_reverse_paged(
    client_custom_settings, snapshots_history
):
    response = client_custom_settings.get(
        "/api/root/snapshots_history",
        params={"reverse": True, "page": 2, "per_page": 2},
    )
    assert response.status_code == 200
    assert response.json() == {
        "page": 2,
        "per_page": 2,
        "total_items": 9,
        "total_pages": 5,
        "items": snapshots_history[3:1:-1],
    }


@pytest.mark.skip("Global reverse not implemented yet for local storage")
def test_root_snapshots_history_global_reverse(
    client_custom_settings, snapshots_history
):
    response = client_custom_settings.get(
        "/api/root/snapshots_history", params={"global_reverse": True}
    )
    assert response.status_code == 200
    assert response.json() == {
        "page": 1,
        "per_page": 50,
        "total_items": 9,
        "total_pages": 1,
        "items": snapshots_history[::-1],
    }


@pytest.mark.skip("Global reverse not implemented yet for local storage")
def test_root_snapshots_history_global_reverse_paged(
    client_custom_settings, snapshots_history
):
    response = client_custom_settings.get(
        "/api/main/snapshots_history",
        params={"global_reverse": True, "page": 2, "per_page": 2},
    )
    assert response.status_code == 200
    assert response.json() == {
        "page": 2,
        "per_page": 2,
        "total_items": 9,
        "total_pages": 5,
        "items": snapshots_history[7:5:-1],
    }


@pytest.mark.parametrize(
    "page, per_page, total_pages, expected_range",
    (
        (1, 3, 3, (0, 3)),
        (2, 3, 3, (3, 6)),
        (3, 3, 3, (6, 9)),
        (4, 3, 3, (0, 0)),
        (1, 2, 5, (0, 2)),
        (5, 2, 5, (8, 9)),
        (1, 9, 1, (0, 9)),
    ),
)
def test_root_snapshots_history_paged(
    client_custom_settings,
    page,
    per_page,
    total_pages,
    expected_range,
    snapshots_history,
):
    response = client_custom_settings.get(
        "/api/root/snapshots_history",
        params={"page": page, "per_page": per_page},
    )

    assert response.status_code == 200
    assert response.json() == {
        "page": page,
        "per_page": per_page,
        "total_items": 9,
        "total_pages": total_pages,
        "items": snapshots_history[expected_range[0] : expected_range[1]],
    }


def test_root_nodes_history_default_args(
    client_custom_settings, snapshots_history, dfss_history
):
    response = client_custom_settings.get("/api/root/nodes_history")
    assert response.status_code == 200
    assert response.json() == {
        "page": 1,
        "per_page": 50,
        "total_items": 9,
        "total_pages": 1,
        "items": [
            {"id": snapshot["id"], "snapshot": snapshot, "storage": dfs}
            for snapshot, dfs in zip(
                snapshots_history, dfss_history, strict=False
            )
        ],
    }


def test_root_nodes_history_reverse(
    client_custom_settings, snapshots_history, dfss_history
):
    response = client_custom_settings.get(
        "/api/root/nodes_history", params={"reverse": True}
    )
    assert response.status_code == 200
    assert response.json() == {
        "page": 1,
        "per_page": 50,
        "total_items": 9,
        "total_pages": 1,
        "items": [
            {"id": snapshot["id"], "snapshot": snapshot, "storage": dfs}
            for snapshot, dfs in zip(
                snapshots_history[::-1], dfss_history[::-1], strict=False
            )
        ],
    }


def test_root_nodes_history_reverse_paged(
    client_custom_settings, snapshots_history, dfss_history
):
    response = client_custom_settings.get(
        "/api/root/nodes_history",
        params={"reverse": True, "page": 2, "per_page": 2},
    )
    assert response.status_code == 200
    assert response.json() == {
        "page": 2,
        "per_page": 2,
        "total_items": 9,
        "total_pages": 5,
        "items": [
            {"id": snapshot["id"], "snapshot": snapshot, "storage": dfs}
            for snapshot, dfs in zip(
                snapshots_history[3:1:-1], dfss_history[3:1:-1], strict=False
            )
        ],
    }


@pytest.mark.skip("Global reverse not implemented yet for local storage")
def test_root_nodes_history_global_reverse(
    client_custom_settings, snapshots_history, dfss_history
):
    response = client_custom_settings.get(
        "/api/root/nodes_history", params={"global_reverse": True}
    )
    assert response.status_code == 200
    assert response.json() == {
        "page": 1,
        "per_page": 50,
        "total_items": 9,
        "total_pages": 1,
        "items": [
            {"id": snapshot["id"], "snapshot": snapshot, "storage": dfs}
            for snapshot, dfs in zip(
                snapshots_history[::-1], dfss_history[::-1], strict=False
            )
        ],
    }


@pytest.mark.skip("Global reverse not implemented yet for local storage")
def test_root_nodes_history_global_reverse_paged(
    client_custom_settings, snapshots_history, dfss_history
):
    response = client_custom_settings.get(
        "/api/root/nodes_history",
        params={"global_reverse": True, "page": 2, "per_page": 2},
    )
    assert response.status_code == 200
    assert response.json() == {
        "page": 2,
        "per_page": 2,
        "total_items": 9,
        "total_pages": 5,
        "items": [
            {"id": snapshot["id"], "snapshot": snapshot, "storage": dfs}
            for snapshot, dfs in zip(
                snapshots_history[7:5:-1], dfss_history[7:5:-1], strict=False
            )
        ],
    }


@pytest.mark.parametrize(
    "page, per_page, total_pages, expected_range",
    (
        (1, 3, 3, (0, 3)),
        (2, 3, 3, (3, 6)),
        (3, 3, 3, (6, 9)),
        (4, 3, 3, (0, 0)),
        (1, 2, 5, (0, 2)),
        (5, 2, 5, (8, 9)),
        (1, 9, 1, (0, 9)),
    ),
)
def test_root_nodes_history_paged(
    client_custom_settings,
    snapshots_history,
    dfss_history,
    page,
    per_page,
    total_pages,
    expected_range,
):
    response = client_custom_settings.get(
        "/api/root/nodes_history",
        params={"page": page, "per_page": per_page},
    )

    assert response.status_code == 200
    requested_ids = tuple(range(*expected_range))

    assert response.json() == {
        "page": page,
        "per_page": per_page,
        "total_items": 9,
        "total_pages": total_pages,
        "items": [
            {"id": snapshot["id"], "snapshot": snapshot, "storage": dfs}
            for _, (snapshot, dfs) in filter(
                lambda d: d[0] in requested_ids,
                enumerate(zip(snapshots_history, dfss_history, strict=False)),
            )
        ],
    }
