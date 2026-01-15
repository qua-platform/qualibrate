from datetime import date, datetime

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
        "has_next_page": False,
        "items": snapshots_history,
    }


def test_root_snapshots_history_ascending(
    client_custom_settings, snapshots_history
):
    response = client_custom_settings.get(
        "/api/root/snapshots_history", params={"descending": False}
    )
    assert response.status_code == 200
    assert response.json() == {
        "page": 1,
        "per_page": 50,
        "total_items": 9,
        "total_pages": 1,
        "has_next_page": False,
        "items": snapshots_history[::-1],
    }


def test_root_snapshots_history_ascending_paged(
    client_custom_settings, snapshots_history
):
    response = client_custom_settings.get(
        "/api/root/snapshots_history",
        params={"descending": False, "page": 2, "per_page": 2},
    )
    assert response.status_code == 200
    assert response.json() == {
        "page": 2,
        "per_page": 2,
        "total_items": 9,
        "total_pages": 5,
        "has_next_page": True,
        "items": snapshots_history[6:4:-1],
    }


@pytest.mark.parametrize(
    "page, per_page, total_pages, has_next_page, expected_range",
    (
        (1, 3, 3, True, (0, 3)),
        (2, 3, 3, True, (3, 6)),
        (3, 3, 3, False, (6, 9)),
        (4, 3, 3, False, (0, 0)),
        (1, 2, 5, True, (0, 2)),
        (5, 2, 5, False, (8, 9)),
        (1, 9, 1, False, (0, 9)),
    ),
)
def test_root_snapshots_history_paged(
    client_custom_settings,
    page,
    per_page,
    total_pages,
    has_next_page,
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
        "has_next_page": has_next_page,
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
        "has_next_page": False,
        "items": [
            {"id": snapshot["id"], "snapshot": snapshot, "storage": dfs}
            for snapshot, dfs in zip(
                snapshots_history, dfss_history, strict=False
            )
        ],
    }


def test_root_nodes_history_ascending(
    client_custom_settings, snapshots_history, dfss_history
):
    response = client_custom_settings.get(
        "/api/root/nodes_history", params={"descending": False}
    )
    assert response.status_code == 200
    assert response.json() == {
        "page": 1,
        "per_page": 50,
        "total_items": 9,
        "total_pages": 1,
        "has_next_page": False,
        "items": [
            {"id": snapshot["id"], "snapshot": snapshot, "storage": dfs}
            for snapshot, dfs in zip(
                snapshots_history[::-1], dfss_history[::-1], strict=False
            )
        ],
    }


def test_root_nodes_history_ascending_paged(
    client_custom_settings, snapshots_history, dfss_history
):
    response = client_custom_settings.get(
        "/api/root/nodes_history",
        params={"descending": False, "page": 2, "per_page": 2},
    )
    assert response.status_code == 200
    assert response.json() == {
        "page": 2,
        "per_page": 2,
        "total_items": 9,
        "total_pages": 5,
        "has_next_page": True,
        "items": [
            {"id": snapshot["id"], "snapshot": snapshot, "storage": dfs}
            for snapshot, dfs in zip(
                snapshots_history[6:4:-1],
                dfss_history[6:4:-1],
                strict=False,  # , strict=False
            )
        ],
    }


@pytest.mark.parametrize(
    "page, per_page, total_pages, has_next_page, expected_range",
    (
        (1, 3, 3, True, (0, 3)),
        (2, 3, 3, True, (3, 6)),
        (3, 3, 3, False, (6, 9)),
        (4, 3, 3, False, (0, 0)),
        (1, 2, 5, True, (0, 2)),
        (5, 2, 5, False, (8, 9)),
        (1, 9, 1, False, (0, 9)),
    ),
)
def test_root_nodes_history_paged(
    client_custom_settings,
    snapshots_history,
    dfss_history,
    page,
    per_page,
    total_pages,
    has_next_page,
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
        "has_next_page": has_next_page,
        "items": [
            {"id": snapshot["id"], "snapshot": snapshot, "storage": dfs}
            for _, (snapshot, dfs) in filter(
                lambda d: d[0] in requested_ids,
                enumerate(zip(snapshots_history, dfss_history, strict=False)),
            )
        ],
    }


@pytest.mark.parametrize(
    (
        "filter_no_change, descending, page, per_page, has_next_page, "
        "search_filters, expected_range"
    ),
    [
        (False, True, 2, 3, True, {}, range(3, 6)),
        (True, True, 2, 3, True, {}, range(3, 6)),
        (True, False, 2, 3, True, {}, range(5, 2, -1)),
        (False, False, 2, 3, True, {}, range(5, 2, -1)),
        (True, True, 2, 3, True, {"max_node_id": 7}, range(5, 8)),
        (
            True,
            True,
            2,
            3,
            False,
            {"max_node_id": 7, "min_node_id": 4},
            range(5, 6),
        ),
        (
            True,
            True,
            3,
            3,
            False,
            {"max_node_id": 7, "min_node_id": 4},
            range(0),
        ),
        (
            True,
            True,
            1,
            3,
            True,
            {"max_date": date(2024, 4, 25).isoformat()},
            range(6, 9),
        ),
        (
            True,
            True,
            2,
            3,
            False,
            {"max_date": date(2024, 4, 25).isoformat()},
            range(0),
        ),
        (
            True,
            True,
            1,
            3,
            True,
            {"min_date": date(2024, 4, 27).isoformat()},
            range(3),
        ),
        (
            True,
            True,
            2,
            3,
            False,
            {"min_date": date(2024, 4, 27).isoformat()},
            range(0),
        ),
    ],
)
def test_data_file_get_node_storage_content(
    client_custom_settings,
    snapshots_history,
    default_local_storage_project,
    filter_no_change,
    descending,
    page,
    per_page,
    has_next_page,
    search_filters,
    expected_range,
):
    response = client_custom_settings.get(
        "/api/root/snapshots/search",
        params={
            "filter_no_change": filter_no_change,
            "descending": descending,
            "data_path": "quam.node",
            "page": page,
            "per_page": per_page,
            **search_filters,
        },
    )
    assert response.status_code == 200
    assert response.json() == {
        "page": page,
        "per_page": per_page,
        "total_items": 0,
        "total_pages": 0,
        "has_next_page": has_next_page,
        "items": [
            {
                "snapshot": {
                    "id": snapshots_history[i]["id"],
                    "created_at": snapshots_history[i]["created_at"],
                    "parents": snapshots_history[i]["parents"],
                },
                "key": ["quam", "node"],
                "value": snapshots_history[i]["id"],
            }
            for i in expected_range
        ],
    }
