import importlib.util
import sys
from datetime import datetime, timezone
from pathlib import Path

from qualibrate.app.api.core.models.snapshot import (
    SimplifiedSnapshotWithMetadata,
    SnapshotMetadata,
)
from qualibrate.core.models.execution_type import ExecutionType

# Load snapshot_history module directly to avoid loading FastAPI routes
# Path: tests/app/api/routes/utils/test_snapshot_history.py -> src/...
_module_path = (
    Path(__file__).parent.parent.parent.parent.parent.parent
    / "src"
    / "qualibrate"
    / "app"
    / "api"
    / "routes"
    / "utils"
    / "snapshot_history.py"
)
_spec = importlib.util.spec_from_file_location("snapshot_history", _module_path)
_snapshot_history = importlib.util.module_from_spec(_spec)
sys.modules["snapshot_history"] = _snapshot_history
_spec.loader.exec_module(_snapshot_history)

build_snapshot_tree = _snapshot_history.build_snapshot_tree
compute_workflow_aggregates = _snapshot_history.compute_workflow_aggregates
convert_to_history_item = _snapshot_history.convert_to_history_item
count_nested_items = _snapshot_history.count_nested_items
paginate_nested_items = _snapshot_history.paginate_nested_items


def create_snapshot(
    id: int,
    name: str = "test",
    type_of_execution: str = "node",
    children: list = None,
    workflow_parent_id: int = None,
    status: str = "finished",
    created_at: datetime = None,
) -> SimplifiedSnapshotWithMetadata:
    """Helper to create test snapshots."""
    metadata_dict = {
        "name": name,
        "status": status,
        "type_of_execution": type_of_execution,
    }
    if children is not None:
        metadata_dict["children"] = children
    if workflow_parent_id is not None:
        metadata_dict["workflow_parent_id"] = workflow_parent_id

    metadata = SnapshotMetadata(**metadata_dict)

    return SimplifiedSnapshotWithMetadata(
        id=id,
        created_at=created_at or datetime.now(timezone.utc),
        parents=[id - 1] if id > 1 else [],
        metadata=metadata,
    )


class TestConvertToHistoryItem:
    """Tests for convert_to_history_item function."""

    def test_convert_node_snapshot(self):
        """Test converting a node snapshot."""
        snapshot = create_snapshot(1, name="test_node", type_of_execution="node")

        result = convert_to_history_item(snapshot)

        assert result.id == 1
        assert result.type_of_execution == ExecutionType.node
        assert result.metadata.name == "test_node"
        assert result.items is None

    def test_convert_workflow_snapshot(self):
        """Test converting a workflow snapshot."""
        snapshot = create_snapshot(
            1,
            name="test_workflow",
            type_of_execution="workflow",
            children=[2, 3, 4],
        )

        result = convert_to_history_item(snapshot)

        assert result.type_of_execution == ExecutionType.workflow
        assert result.metadata.children == [2, 3, 4]

    def test_convert_with_workflow_parent_id(self):
        """Test converting snapshot with parent workflow."""
        snapshot = create_snapshot(2, workflow_parent_id=1)

        result = convert_to_history_item(snapshot)

        assert result.metadata.workflow_parent_id == 1

    def test_convert_invalid_execution_type_defaults_to_node(self):
        """Test that invalid execution type defaults to node."""
        snapshot = create_snapshot(1)
        # Manually set invalid type
        snapshot.metadata.__dict__["type_of_execution"] = "invalid"

        result = convert_to_history_item(snapshot)

        assert result.type_of_execution == ExecutionType.node


class TestBuildSnapshotTree:
    """Tests for build_snapshot_tree function."""

    def test_empty_list(self):
        """Test with empty snapshot list."""
        result = build_snapshot_tree([])
        assert result == []

    def test_single_node(self):
        """Test with single node snapshot."""
        snapshots = [create_snapshot(1, name="single_node")]

        result = build_snapshot_tree(snapshots)

        assert len(result) == 1
        assert result[0].id == 1
        assert result[0].items is None

    def test_workflow_with_children(self):
        """Test workflow with child nodes."""
        snapshots = [
            create_snapshot(
                1,
                name="workflow",
                type_of_execution="workflow",
                children=[2, 3],
            ),
            create_snapshot(2, name="child1", workflow_parent_id=1),
            create_snapshot(3, name="child2", workflow_parent_id=1),
        ]

        result = build_snapshot_tree(snapshots)

        # Only workflow should be at top level
        assert len(result) == 1
        assert result[0].id == 1
        assert result[0].items is not None
        assert len(result[0].items) == 2
        assert {item.id for item in result[0].items} == {2, 3}

    def test_nested_workflows(self):
        """Test nested workflow structure."""
        snapshots = [
            create_snapshot(
                1, name="outer_workflow", type_of_execution="workflow", children=[2]
            ),
            create_snapshot(
                2,
                name="inner_workflow",
                type_of_execution="workflow",
                children=[3],
                workflow_parent_id=1,
            ),
            create_snapshot(3, name="leaf_node", workflow_parent_id=2),
        ]

        result = build_snapshot_tree(snapshots)

        assert len(result) == 1
        assert result[0].id == 1
        assert result[0].items[0].id == 2
        assert result[0].items[0].items[0].id == 3

    def test_missing_children_not_included(self):
        """Test that references to missing children are skipped."""
        snapshots = [
            create_snapshot(
                1,
                name="workflow",
                type_of_execution="workflow",
                children=[2, 99],  # 99 doesn't exist
            ),
            create_snapshot(2, name="child", workflow_parent_id=1),
        ]

        result = build_snapshot_tree(snapshots)

        assert len(result[0].items) == 1
        assert result[0].items[0].id == 2


class TestComputeWorkflowAggregates:
    """Tests for compute_workflow_aggregates function."""

    def test_empty_workflow(self):
        """Test workflow with no items."""
        snapshot = create_snapshot(1, type_of_execution="workflow")
        item = convert_to_history_item(snapshot)
        item.items = None

        compute_workflow_aggregates(item)

        # Should not modify anything
        assert item.nodes_completed is None
        assert item.nodes_total is None

    def test_workflow_with_successful_nodes(self):
        """Test workflow with all successful nodes."""
        snapshots = [
            create_snapshot(
                1, type_of_execution="workflow", children=[2, 3], status="finished"
            ),
            create_snapshot(2, status="finished"),
            create_snapshot(3, status="success"),
        ]

        result = build_snapshot_tree(snapshots)
        workflow = result[0]

        assert workflow.nodes_completed == 2
        assert workflow.nodes_total == 2

    def test_workflow_with_failed_nodes(self):
        """Test workflow with failed nodes."""
        snapshots = [
            create_snapshot(
                1, type_of_execution="workflow", children=[2, 3], status="finished"
            ),
            create_snapshot(2, name="good_node", status="finished"),
            create_snapshot(3, name="bad_node", status="error"),
        ]

        result = build_snapshot_tree(snapshots)
        workflow = result[0]

        assert workflow.nodes_completed == 1
        assert workflow.nodes_total == 2


class TestCountNestedItems:
    """Tests for count_nested_items function."""

    def test_empty_list(self):
        """Test counting empty list."""
        assert count_nested_items([]) == 0

    def test_flat_list(self):
        """Test counting flat list."""
        snapshots = [
            create_snapshot(1),
            create_snapshot(2),
            create_snapshot(3),
        ]
        items = [convert_to_history_item(s) for s in snapshots]

        assert count_nested_items(items) == 3

    def test_nested_items(self):
        """Test counting with nested items."""
        snapshots = [
            create_snapshot(
                1, type_of_execution="workflow", children=[2, 3], status="finished"
            ),
            create_snapshot(2),
            create_snapshot(3),
        ]

        tree = build_snapshot_tree(snapshots)

        # 1 workflow + 2 children = 3
        assert count_nested_items(tree) == 3


class TestPaginateNestedItems:
    """Tests for paginate_nested_items function."""

    def test_empty_list(self):
        """Test paginating empty list."""
        result, total = paginate_nested_items([], page=1, per_page=10)
        assert result == []
        assert total == 0

    def test_first_page(self):
        """Test getting first page."""
        snapshots = [create_snapshot(i) for i in range(1, 11)]
        items = [convert_to_history_item(s) for s in snapshots]

        result, total = paginate_nested_items(items, page=1, per_page=3)

        assert total == 10
        assert len(result) == 3
        assert [item.id for item in result] == [1, 2, 3]

    def test_middle_page(self):
        """Test getting middle page."""
        snapshots = [create_snapshot(i) for i in range(1, 11)]
        items = [convert_to_history_item(s) for s in snapshots]

        result, total = paginate_nested_items(items, page=2, per_page=3)

        assert total == 10
        assert len(result) == 3
        assert [item.id for item in result] == [4, 5, 6]

    def test_last_page_partial(self):
        """Test getting last page with partial results."""
        snapshots = [create_snapshot(i) for i in range(1, 11)]
        items = [convert_to_history_item(s) for s in snapshots]

        result, total = paginate_nested_items(items, page=4, per_page=3)

        assert total == 10
        assert len(result) == 1
        assert result[0].id == 10

    def test_page_beyond_data(self):
        """Test requesting page beyond available data."""
        snapshots = [create_snapshot(i) for i in range(1, 4)]
        items = [convert_to_history_item(s) for s in snapshots]

        result, total = paginate_nested_items(items, page=5, per_page=3)

        assert total == 3
        assert result == []

    def test_pagination_with_nested_items(self):
        """Test pagination correctly counts nested items."""
        # Create a workflow with 2 children
        snapshots = [
            create_snapshot(1, type_of_execution="workflow", children=[2, 3]),
            create_snapshot(2),
            create_snapshot(3),
            create_snapshot(4),  # standalone
        ]

        tree = build_snapshot_tree(snapshots)

        # Total should be 4 (workflow + 2 children + standalone)
        result, total = paginate_nested_items(tree, page=1, per_page=10)
        assert total == 4
