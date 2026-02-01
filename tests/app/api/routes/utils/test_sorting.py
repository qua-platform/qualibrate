import importlib.util
import sys
from datetime import datetime, timezone
from pathlib import Path

from qualibrate.app.api.core.models.snapshot import (
    SimplifiedSnapshotWithMetadata,
    SnapshotMetadata,
)
from qualibrate.app.api.core.types import SortField

# Load sorting module directly to avoid loading FastAPI routes
# Path: tests/app/api/routes/utils/test_sorting.py -> src/...
_module_path = (
    Path(__file__).parent.parent.parent.parent.parent.parent
    / "src"
    / "qualibrate"
    / "app"
    / "api"
    / "routes"
    / "utils"
    / "sorting.py"
)
_spec = importlib.util.spec_from_file_location("sorting", _module_path)
_sorting = importlib.util.module_from_spec(_spec)
sys.modules["sorting"] = _sorting
_spec.loader.exec_module(_sorting)

get_sort_key = _sorting.get_sort_key


def create_snapshot(
    id: int,
    name: str = None,
    status: str = None,
    created_at: datetime = None,
) -> SimplifiedSnapshotWithMetadata:
    """Helper to create test snapshots."""
    metadata = SnapshotMetadata(name=name, status=status)
    return SimplifiedSnapshotWithMetadata(
        id=id,
        created_at=created_at or datetime.now(timezone.utc),
        parents=[],
        metadata=metadata,
    )


class TestGetSortKey:
    """Tests for get_sort_key function."""

    def test_sort_by_name(self):
        """Test sorting by name."""
        snapshot = create_snapshot(1, name="Test Calibration")

        priority, value = get_sort_key(snapshot, SortField.name)

        assert priority == 0  # Name exists
        assert value == "test calibration"  # Lowercase

    def test_sort_by_name_null(self):
        """Test sorting by name with null name."""
        snapshot = create_snapshot(1, name=None)

        priority, value = get_sort_key(snapshot, SortField.name)

        assert priority == 1  # None sorts last
        assert value == ""

    def test_sort_by_date(self):
        """Test sorting by date."""
        now = datetime.now(timezone.utc)
        snapshot = create_snapshot(1, created_at=now)

        priority, value = get_sort_key(snapshot, SortField.date)

        assert priority == 0  # Date exists
        assert value == now

    def test_sort_by_date_comparison(self):
        """Test that dates sort correctly."""
        t1 = datetime(2024, 1, 1, tzinfo=timezone.utc)
        t2 = datetime(2024, 1, 2, tzinfo=timezone.utc)
        snapshot1 = create_snapshot(1, created_at=t1)
        snapshot2 = create_snapshot(2, created_at=t2)

        key1 = get_sort_key(snapshot1, SortField.date)
        key2 = get_sort_key(snapshot2, SortField.date)

        # Earlier date should sort before later date
        assert key1 < key2

    def test_sort_by_status_finished(self):
        """Test sorting by status - finished."""
        snapshot = create_snapshot(1, status="finished")

        priority, value = get_sort_key(snapshot, SortField.status)

        # Finished should have low priority (sorts first when ascending)
        assert priority == 0
        assert value == "finished"

    def test_sort_by_status_error(self):
        """Test sorting by status - error."""
        snapshot = create_snapshot(1, status="error")

        priority, value = get_sort_key(snapshot, SortField.status)

        # Error should have high priority (sorts last when ascending)
        assert priority == 4
        assert value == "error"

    def test_sort_by_status_null(self):
        """Test sorting by status with null status."""
        snapshot = create_snapshot(1, status=None)

        priority, value = get_sort_key(snapshot, SortField.status)

        # Unknown status gets high priority
        assert priority >= 4
        assert value == ""

    def test_sorting_order_by_name(self):
        """Test actual sorting order by name."""
        snapshots = [
            create_snapshot(1, name="Zebra"),
            create_snapshot(2, name="Alpha"),
            create_snapshot(3, name=None),
            create_snapshot(4, name="beta"),  # Lowercase to test case-insensitivity
        ]

        sorted_snapshots = sorted(
            snapshots,
            key=lambda s: get_sort_key(s, SortField.name),
        )

        # Should be: Alpha, beta, Zebra, None
        assert [s.id for s in sorted_snapshots] == [2, 4, 1, 3]

    def test_sorting_order_by_date(self):
        """Test actual sorting order by date."""
        t1 = datetime(2024, 1, 1, tzinfo=timezone.utc)
        t2 = datetime(2024, 1, 2, tzinfo=timezone.utc)
        t3 = datetime(2024, 1, 3, tzinfo=timezone.utc)

        snapshots = [
            create_snapshot(1, created_at=t2),
            create_snapshot(2, created_at=t1),
            create_snapshot(3, created_at=None),
            create_snapshot(4, created_at=t3),
        ]

        sorted_snapshots = sorted(
            snapshots,
            key=lambda s: get_sort_key(s, SortField.date),
        )

        # Should be: t1, t2, t3, None
        assert [s.id for s in sorted_snapshots] == [2, 1, 4, 3]

    def test_sorting_order_by_status(self):
        """Test actual sorting order by status."""
        snapshots = [
            create_snapshot(1, status="error"),
            create_snapshot(2, status="finished"),
            create_snapshot(3, status="running"),
            create_snapshot(4, status="pending"),
            create_snapshot(5, status="skipped"),
        ]

        sorted_snapshots = sorted(
            snapshots,
            key=lambda s: get_sort_key(s, SortField.status),
        )

        # Should be: finished, skipped, pending, running, error
        assert [s.id for s in sorted_snapshots] == [2, 5, 4, 3, 1]

    def test_descending_parameter_not_used_in_key(self):
        """Test that descending param doesn't affect key generation."""
        snapshot = create_snapshot(1, name="test")

        key_asc = get_sort_key(snapshot, SortField.name, descending=False)
        key_desc = get_sort_key(snapshot, SortField.name, descending=True)

        # Keys should be identical - descending is handled by sort() reverse param
        assert key_asc == key_desc
