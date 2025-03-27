import pytest


def test_snapshot_get_snapshot_default(
    client_custom_settings, default_local_storage_project, snapshots_history
):
    snapshot_id = 4
    response = client_custom_settings.get(f"/api/snapshot/{snapshot_id}/")
    snapshot = snapshots_history[len(snapshots_history) - snapshot_id]
    snapshot.update(
        {
            "data": {
                "quam": {
                    "quam": {"node": snapshot_id},
                    "info": "snapshot",
                },
                "parameters": None,
                "outcomes": None,
            },
        }
    )
    assert response.status_code == 200
    assert response.json() == snapshot


@pytest.mark.parametrize(
    "load_type, to_update",
    (
        (
            1,
            {
                "metadata": {
                    "description": None,
                    "run_end": None,
                    "run_start": None,
                    "run_duration": None,
                    "status": None,
                },
                "data": None,
            },
        ),
        (
            2,
            {
                "data": None,
            },
        ),
        (
            3,
            {
                "data": {
                    "quam": {"quam": {"node": 4}, "info": "snapshot"},
                    "parameters": None,
                    "outcomes": None,
                }
            },
        ),
        (
            4,
            {
                "data": {
                    "quam": {"quam": {"node": 4}, "info": "snapshot"},
                    "parameters": None,
                    "outcomes": None,
                }
            },
        ),
    ),
)
def test_snapshot_get_snapshot_load_type(
    client_custom_settings,
    default_local_storage_project,
    snapshots_history,
    load_type,
    to_update,
):
    snapshot_id = 4
    response = client_custom_settings.get(
        f"/api/snapshot/{snapshot_id}/",
        params={"load_type": load_type},
    )
    snapshot = snapshots_history[len(snapshots_history) - snapshot_id]
    snapshot.update(to_update)
    assert response.status_code == 200
    assert response.json() == snapshot


@pytest.mark.parametrize("snapshot_id", [9, 4, 1])
def test_snapshot_history_default(
    client_custom_settings, snapshots_history, snapshot_id
):
    response = client_custom_settings.get(
        f"/api/snapshot/{snapshot_id}/history"
    )
    assert response.status_code == 200
    assert response.json() == {
        "page": 1,
        "per_page": 50,
        "total_items": 9,
        "total_pages": 1,
        "items": snapshots_history[len(snapshots_history) - snapshot_id :],
    }


def test_snapshots_compare_by_id(client_custom_settings, snapshots_history):
    response = client_custom_settings.get(
        "/api/snapshot/3/compare", params={"id_to_compare": 5}
    )
    assert response.status_code == 200
    assert response.json() == {"/quam/node": {"old": 3, "new": 5}}

    response = client_custom_settings.get(
        "/api/snapshot/5/compare", params={"id_to_compare": 3}
    )
    assert response.status_code == 200
    assert response.json() == {"/quam/node": {"old": 5, "new": 3}}


@pytest.mark.parametrize(
    "s_id, data_path, result",
    (
        (3, "quam", [{"key": ["quam"], "value": {"node": 3}}]),
        (3, "quam.node", [{"key": ["quam", "node"], "value": 3}]),
        (6, "quam", [{"key": ["quam"], "value": {"node": 6}}]),
        (6, "quam.node", [{"key": ["quam", "node"], "value": 6}]),
    ),
)
def test_snapshots_search_data(client_custom_settings, s_id, data_path, result):
    response = client_custom_settings.get(
        f"/api/snapshot/{s_id}/search/data/values",
        params={"data_path": data_path},
    )
    assert response.status_code == 200
    assert response.json() == result


@pytest.mark.parametrize(
    "s_id, data_path, result",
    (
        (3, "quam.*", [{"key": ["quam", "node"], "value": 3}]),
        (3, "*.node", [{"key": ["quam", "node"], "value": 3}]),
    ),
)
def test_snapshots_search_data_wildcard(
    client_custom_settings, s_id, data_path, result
):
    response = client_custom_settings.get(
        f"/api/snapshot/{s_id}/search/data/values",
        params={"data_path": data_path},
    )
    assert response.status_code == 200
    assert response.json() == result


@pytest.mark.parametrize(
    "s_id, target_key, result",
    (
        (3, "quam", [{"path": ["quam"], "value": {"node": 3}}]),
        (3, "node", [{"path": ["quam", "node"], "value": 3}]),
        (6, "quam", [{"path": ["quam"], "value": {"node": 6}}]),
        (6, "node", [{"path": ["quam", "node"], "value": 6}]),
    ),
)
def test_snapshots_search_recursive_data(
    client_custom_settings, s_id, target_key, result
):
    response = client_custom_settings.get(
        f"/api/snapshot/{s_id}/search/data/value/any_depth",
        params={"target_key": target_key},
    )
    assert response.status_code == 200
    assert response.json() == result
