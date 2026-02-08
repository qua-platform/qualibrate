"""Tests for search and sort features on /snapshots_history endpoint.

These tests cover:
- Exact name filtering (`name` parameter)
- Sorting by name, date, and status (`sort` parameter)
- Validation that `name` and `name_part` cannot be used together
- Combined filtering and sorting
"""

import json
from collections.abc import Generator
from datetime import date, datetime, time, timedelta, timezone
from pathlib import Path
from typing import Any

import pytest

from qualibrate.app.api.core.domain.local_storage.utils.local_path_id import (
    IdToLocalPath,
)


def _setup_local_storage_with_statuses(project_path: Path) -> Path:
    """Create test snapshots with varied statuses for sort testing."""
    project_path.mkdir(parents=True)

    # Define snapshots with different statuses and names for sorting tests
    # Using a single date to simplify, varied statuses
    snapshots_data = [
        {"id": 1, "name": "alpha_cal", "status": "finished"},
        {"id": 2, "name": "beta_cal", "status": "error"},
        {"id": 3, "name": "gamma_cal", "status": "running"},
        {"id": 4, "name": "delta_cal", "status": "pending"},
        {"id": 5, "name": "epsilon_cal", "status": "skipped"},
        {"id": 6, "name": "zeta_cal", "status": "finished"},
        {"id": 7, "name": "eta_cal", "status": None},
        {"id": 8, "name": "theta_cal", "status": "error"},
    ]

    node_date = date(2024, 5, 15)
    node_date_str = node_date.isoformat()
    date_dir = project_path / node_date_str
    date_dir.mkdir()

    for snap in snapshots_data:
        node_id = snap["id"]
        node_name = snap["name"]
        status = snap["status"]

        node_time = time(10 + node_id, 0, 0)
        node_time_str = node_time.strftime("%H%M%S")
        node_dir_name = f"#{node_id}_{node_name}_{node_time_str}"
        node_dir = date_dir / node_dir_name
        node_dir.mkdir()

        created_at = datetime(
            node_date.year,
            node_date.month,
            node_date.day,
            node_time.hour,
            node_time.minute,
            node_time.second,
        ).replace(tzinfo=timezone(timedelta(seconds=10800)))

        duration = node_id * 2
        run_start = (created_at - timedelta(seconds=duration)).isoformat(timespec="seconds")
        run_end = created_at.isoformat(timespec="seconds")

        metadata = {
            "name": node_name,
            "data_path": str(Path(node_date_str, node_dir_name)),
            "run_start": run_start,
            "run_end": run_end,
            "status": status,
        }

        node_file = node_dir / "node.json"
        node_file.write_text(
            json.dumps(
                {
                    "created_at": created_at.isoformat(timespec="seconds"),
                    "metadata": metadata,
                    "data": {"quam": "./state.json"},
                    "parents": [node_id - 1] if node_id > 1 else [],
                    "id": node_id,
                }
            )
        )

        snapshot_file = node_dir / "state.json"
        snapshot_file.write_text(json.dumps({"quam": {"node": node_id}, "info": "snapshot"}))

    return project_path


@pytest.fixture
def local_storage_with_statuses(
    tmp_path: Path,
) -> Generator[Path, None, None]:
    """Fixture that creates snapshots with varied statuses for sort testing."""
    project_path = tmp_path / "local_storage" / "project"
    yield _setup_local_storage_with_statuses(project_path)
    IdToLocalPath()._project_to_manager.clear()


@pytest.fixture
def snapshots_with_statuses() -> Generator[list[dict[str, Any]], None, None]:
    """Expected snapshot data with varied statuses, ordered by id descending."""
    yield [
        {
            "created_at": "2024-05-15T18:00:00+03:00",
            "id": 8,
            "parents": [7],
            "metadata": {
                "name": "theta_cal",
                "data_path": "2024-05-15/#8_theta_cal_180000",
                "run_start": "2024-05-15T17:59:44+03:00",
                "run_end": "2024-05-15T18:00:00+03:00",
                "run_duration": 16.0,
                "description": None,
                "status": "error",
            },
        },
        {
            "created_at": "2024-05-15T17:00:00+03:00",
            "id": 7,
            "parents": [6],
            "metadata": {
                "name": "eta_cal",
                "data_path": "2024-05-15/#7_eta_cal_170000",
                "run_start": "2024-05-15T16:59:46+03:00",
                "run_end": "2024-05-15T17:00:00+03:00",
                "run_duration": 14.0,
                "description": None,
                "status": None,
            },
        },
        {
            "created_at": "2024-05-15T16:00:00+03:00",
            "id": 6,
            "parents": [5],
            "metadata": {
                "name": "zeta_cal",
                "data_path": "2024-05-15/#6_zeta_cal_160000",
                "run_start": "2024-05-15T15:59:48+03:00",
                "run_end": "2024-05-15T16:00:00+03:00",
                "run_duration": 12.0,
                "description": None,
                "status": "finished",
            },
        },
        {
            "created_at": "2024-05-15T15:00:00+03:00",
            "id": 5,
            "parents": [4],
            "metadata": {
                "name": "epsilon_cal",
                "data_path": "2024-05-15/#5_epsilon_cal_150000",
                "run_start": "2024-05-15T14:59:50+03:00",
                "run_end": "2024-05-15T15:00:00+03:00",
                "run_duration": 10.0,
                "description": None,
                "status": "skipped",
            },
        },
        {
            "created_at": "2024-05-15T14:00:00+03:00",
            "id": 4,
            "parents": [3],
            "metadata": {
                "name": "delta_cal",
                "data_path": "2024-05-15/#4_delta_cal_140000",
                "run_start": "2024-05-15T13:59:52+03:00",
                "run_end": "2024-05-15T14:00:00+03:00",
                "run_duration": 8.0,
                "description": None,
                "status": "pending",
            },
        },
        {
            "created_at": "2024-05-15T13:00:00+03:00",
            "id": 3,
            "parents": [2],
            "metadata": {
                "name": "gamma_cal",
                "data_path": "2024-05-15/#3_gamma_cal_130000",
                "run_start": "2024-05-15T12:59:54+03:00",
                "run_end": "2024-05-15T13:00:00+03:00",
                "run_duration": 6.0,
                "description": None,
                "status": "running",
            },
        },
        {
            "created_at": "2024-05-15T12:00:00+03:00",
            "id": 2,
            "parents": [1],
            "metadata": {
                "name": "beta_cal",
                "data_path": "2024-05-15/#2_beta_cal_120000",
                "run_start": "2024-05-15T11:59:56+03:00",
                "run_end": "2024-05-15T12:00:00+03:00",
                "run_duration": 4.0,
                "description": None,
                "status": "error",
            },
        },
        {
            "created_at": "2024-05-15T11:00:00+03:00",
            "id": 1,
            "parents": [],
            "metadata": {
                "name": "alpha_cal",
                "data_path": "2024-05-15/#1_alpha_cal_110000",
                "run_start": "2024-05-15T10:59:58+03:00",
                "run_end": "2024-05-15T11:00:00+03:00",
                "run_duration": 2.0,
                "description": None,
                "status": "finished",
            },
        },
    ]


# =============================================================================
# Fixtures for client with status-enabled storage
# =============================================================================


@pytest.fixture
def settings_with_statuses(tmp_path: Path, local_storage_with_statuses: Path) -> Generator[Any, None, None]:
    """Settings configured for status-enabled local storage."""
    from qualibrate_config.models.qualibrate import QualibrateTopLevelConfig
    from qualibrate_config.models.storage_type import StorageType

    static = tmp_path / "static"
    static.mkdir()
    top = QualibrateTopLevelConfig(
        {
            "qualibrate": dict(
                project=local_storage_with_statuses.name,
                app={
                    "static_site_files": static,
                    "timeline_db": dict(
                        address="http://localhost:8000/",
                        timeout=0,
                    ),
                },
                storage=dict(
                    type=StorageType.local_storage,
                    # Use the full project path, not the parent
                    # The app uses storage.location directly as the project path
                    location=local_storage_with_statuses,
                ),
                runner=dict(
                    address="http://localhost:8001/execution/",
                    timeout=1,
                ),
            )
        }
    )
    yield top.qualibrate


@pytest.fixture
def settings_path_with_statuses(
    tmp_path: Path,
) -> Generator[Path, None, None]:
    """Path for config file with status-enabled storage."""
    yield tmp_path / "config_statuses.toml"


@pytest.fixture
def settings_path_filled_with_statuses(
    settings_with_statuses, settings_path_with_statuses: Path
) -> Generator[Path, None, None]:
    """Filled config file for status-enabled storage."""
    import tomli_w

    with settings_path_with_statuses.open("wb") as fin:
        tomli_w.dump(
            settings_with_statuses._root.serialize(),
            fin,
        )
    yield settings_path_with_statuses


@pytest.fixture
def client_with_statuses(
    mocker,
    settings_with_statuses,
    settings_path_filled_with_statuses: Path,
) -> Generator[Any, None, None]:
    """Test client configured with status-enabled local storage."""
    from fastapi.testclient import TestClient
    from qualibrate_config.core.project.path import get_project_path

    from qualibrate.app.config import get_config_path, get_settings

    get_config_path.cache_clear()
    project_path = get_project_path(settings_path_filled_with_statuses.parent, settings_with_statuses.project)
    project_path.mkdir(parents=True, exist_ok=True)
    (project_path / "config.toml").touch()
    mocker.patch(
        "qualibrate.app.config.resolvers.get_config_path",
        return_value=settings_path_filled_with_statuses,
    )

    from qualibrate.app.app import app

    client = TestClient(app)

    app.dependency_overrides[get_config_path] = lambda: settings_path_filled_with_statuses
    app.dependency_overrides[get_settings] = lambda: settings_with_statuses

    yield client


# =============================================================================
# Test: Exact Name Filtering
# =============================================================================


def test_snapshots_history_exact_name_filter(client_custom_settings, default_local_storage_project, snapshots_history):
    """Test filtering by exact name returns only matching snapshots."""
    response = client_custom_settings.get(
        "/api/root/snapshots_history",
        params={"name": "name_5"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["total_items"] == 1
    assert len(data["items"]) == 1
    assert data["items"][0]["metadata"]["name"] == "name_5"
    assert data["items"][0]["id"] == 5


def test_snapshots_history_exact_name_no_match(client_custom_settings, default_local_storage_project):
    """Test exact name filter with no matches returns empty list."""
    response = client_custom_settings.get(
        "/api/root/snapshots_history",
        params={"name": "nonexistent_name"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["total_items"] == 0
    assert data["items"] == []


def test_snapshots_history_name_part_still_works(
    client_custom_settings, default_local_storage_project, snapshots_history
):
    """Test that name_part (substring) filtering still works."""
    response = client_custom_settings.get(
        "/api/root/snapshots_history",
        params={"name_part": "name_"},
    )
    assert response.status_code == 200
    data = response.json()
    # All snapshots have names like "name_1", "name_2", etc.
    assert data["total_items"] == 9


# =============================================================================
# Test: Validation - name and name_part cannot be used together
# =============================================================================


def test_snapshots_history_name_and_name_part_validation(client_custom_settings, default_local_storage_project):
    """Test that using both name and name_part returns 400 error."""
    response = client_custom_settings.get(
        "/api/root/snapshots_history",
        params={"name": "test", "name_part": "cal"},
    )
    assert response.status_code == 400
    data = response.json()
    assert "Cannot use both" in data["detail"]
    assert "name" in data["detail"]
    assert "name_part" in data["detail"]


# =============================================================================
# Test: Sort by Name
# =============================================================================


def test_snapshots_history_sort_by_name_ascending(
    client_with_statuses, local_storage_with_statuses, snapshots_with_statuses
):
    """Test sorting by name in ascending order (A-Z)."""
    response = client_with_statuses.get(
        "/api/root/snapshots_history",
        params={"sort": "name", "descending": False, "per_page": 50},
    )
    assert response.status_code == 200
    data = response.json()
    items = data["items"]

    # Extract names and verify alphabetical order
    names = [item["metadata"]["name"] for item in items]
    assert names == sorted(names), f"Names not in ascending order: {names}"

    # First should be alpha_cal, last should be zeta_cal
    assert names[0] == "alpha_cal"
    assert names[-1] == "zeta_cal"


def test_snapshots_history_sort_by_name_descending(
    client_with_statuses, local_storage_with_statuses, snapshots_with_statuses
):
    """Test sorting by name in descending order (Z-A)."""
    response = client_with_statuses.get(
        "/api/root/snapshots_history",
        params={"sort": "name", "descending": True, "per_page": 50},
    )
    assert response.status_code == 200
    data = response.json()
    items = data["items"]

    names = [item["metadata"]["name"] for item in items]
    assert names == sorted(names, reverse=True), f"Names not in descending order: {names}"

    # First should be zeta_cal, last should be alpha_cal
    assert names[0] == "zeta_cal"
    assert names[-1] == "alpha_cal"


# =============================================================================
# Test: Sort by Date
# =============================================================================


def test_snapshots_history_sort_by_date_descending(
    client_with_statuses, local_storage_with_statuses, snapshots_with_statuses
):
    """Test sorting by date in descending order (newest first)."""
    response = client_with_statuses.get(
        "/api/root/snapshots_history",
        params={"sort": "date", "descending": True, "per_page": 50},
    )
    assert response.status_code == 200
    data = response.json()
    items = data["items"]

    # IDs should be in descending order since higher IDs have later times
    ids = [item["id"] for item in items]
    assert ids == sorted(ids, reverse=True), f"IDs not in descending order: {ids}"


def test_snapshots_history_sort_by_date_ascending(
    client_with_statuses, local_storage_with_statuses, snapshots_with_statuses
):
    """Test sorting by date in ascending order (oldest first)."""
    response = client_with_statuses.get(
        "/api/root/snapshots_history",
        params={"sort": "date", "descending": False, "per_page": 50},
    )
    assert response.status_code == 200
    data = response.json()
    items = data["items"]

    ids = [item["id"] for item in items]
    assert ids == sorted(ids), f"IDs not in ascending order: {ids}"


# =============================================================================
# Test: Sort by Status
# =============================================================================


def test_snapshots_history_sort_by_status_ascending(
    client_with_statuses, local_storage_with_statuses, snapshots_with_statuses
):
    """Test sorting by status in ascending priority order.

    Priority (ascending): finished, skipped, pending, running, error, None
    """
    response = client_with_statuses.get(
        "/api/root/snapshots_history",
        params={"sort": "status", "descending": False, "per_page": 50},
    )
    assert response.status_code == 200
    data = response.json()
    items = data["items"]

    statuses = [item["metadata"]["status"] for item in items]

    # Verify finished comes before skipped, skipped before pending, etc.
    # Expected order: finished (x2), skipped, pending, running, error (x2), None
    expected_priority = ["finished", "skipped", "pending", "running", "error", None]

    def get_priority(status):
        try:
            return expected_priority.index(status)
        except ValueError:
            return len(expected_priority)

    priorities = [get_priority(s) for s in statuses]
    assert priorities == sorted(priorities), f"Statuses not in priority order: {statuses}"


def test_snapshots_history_sort_by_status_descending(
    client_with_statuses, local_storage_with_statuses, snapshots_with_statuses
):
    """Test sorting by status in descending priority order.

    Priority (descending): None, error, running, pending, skipped, finished
    """
    response = client_with_statuses.get(
        "/api/root/snapshots_history",
        params={"sort": "status", "descending": True, "per_page": 50},
    )
    assert response.status_code == 200
    data = response.json()
    items = data["items"]

    statuses = [item["metadata"]["status"] for item in items]

    expected_priority = ["finished", "skipped", "pending", "running", "error", None]

    def get_priority(status):
        try:
            return expected_priority.index(status)
        except ValueError:
            return len(expected_priority)

    priorities = [get_priority(s) for s in statuses]
    assert priorities == sorted(priorities, reverse=True), f"Statuses not in reverse priority order: {statuses}"


# =============================================================================
# Test: Sort with Pagination (verify bug fix - sort happens before pagination)
# =============================================================================


def test_snapshots_history_sort_with_pagination_page1(client_with_statuses, local_storage_with_statuses):
    """Test that sorting is applied before pagination - page 1."""
    response = client_with_statuses.get(
        "/api/root/snapshots_history",
        params={"sort": "name", "descending": False, "page": 1, "per_page": 3},
    )
    assert response.status_code == 200
    data = response.json()

    # Page 1 should have the first 3 names alphabetically
    names = [item["metadata"]["name"] for item in data["items"]]
    assert names == ["alpha_cal", "beta_cal", "delta_cal"]


def test_snapshots_history_sort_with_pagination_page2(client_with_statuses, local_storage_with_statuses):
    """Test that sorting is applied before pagination - page 2."""
    response = client_with_statuses.get(
        "/api/root/snapshots_history",
        params={"sort": "name", "descending": False, "page": 2, "per_page": 3},
    )
    assert response.status_code == 200
    data = response.json()

    # Page 2 should have the next 3 names alphabetically
    names = [item["metadata"]["name"] for item in data["items"]]
    assert names == ["epsilon_cal", "eta_cal", "gamma_cal"]


def test_snapshots_history_sort_with_pagination_page3(client_with_statuses, local_storage_with_statuses):
    """Test that sorting is applied before pagination - page 3 (last)."""
    response = client_with_statuses.get(
        "/api/root/snapshots_history",
        params={"sort": "name", "descending": False, "page": 3, "per_page": 3},
    )
    assert response.status_code == 200
    data = response.json()

    # Page 3 should have the remaining 2 names alphabetically
    names = [item["metadata"]["name"] for item in data["items"]]
    assert names == ["theta_cal", "zeta_cal"]


# =============================================================================
# Test: Combined Filters and Sort
# =============================================================================


def test_snapshots_history_sort_with_name_part_filter(client_with_statuses, local_storage_with_statuses):
    """Test sorting combined with name_part filtering."""
    # Filter for names containing "eta" (eta_cal, beta_cal, theta_cal, zeta_cal)
    response = client_with_statuses.get(
        "/api/root/snapshots_history",
        params={"sort": "name", "descending": False, "name_part": "eta"},
    )
    assert response.status_code == 200
    data = response.json()

    names = [item["metadata"]["name"] for item in data["items"]]
    # Should be filtered and sorted: beta_cal, eta_cal, theta_cal, zeta_cal
    assert names == sorted(names)
    for name in names:
        assert "eta" in name


def test_snapshots_history_sort_with_date_filter(
    client_custom_settings, default_local_storage_project, snapshots_history
):
    """Test sorting combined with date filtering."""
    response = client_custom_settings.get(
        "/api/root/snapshots_history",
        params={
            "sort": "name",
            "descending": False,
            "min_date": "2024-04-26",
            "max_date": "2024-04-26",
        },
    )
    assert response.status_code == 200
    data = response.json()

    # Only snapshots from 2024-04-26 (ids 4, 5, 6)
    ids = [item["id"] for item in data["items"]]
    assert all(id in [4, 5, 6] for id in ids)

    # Should be sorted by name
    names = [item["metadata"]["name"] for item in data["items"]]
    assert names == sorted(names)


# =============================================================================
# Test: Default behavior (no sort parameter)
# =============================================================================


def test_snapshots_history_default_no_sort(client_custom_settings, default_local_storage_project, snapshots_history):
    """Test that without sort parameter, default ordering is by ID descending."""
    response = client_custom_settings.get(
        "/api/root/snapshots_history",
        params={"descending": True},
    )
    assert response.status_code == 200
    data = response.json()

    # Default behavior: ordered by ID descending
    ids = [item["id"] for item in data["items"]]
    assert ids == sorted(ids, reverse=True)
