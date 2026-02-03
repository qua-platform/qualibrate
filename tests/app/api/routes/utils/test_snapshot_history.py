import importlib.util
import sys
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from qualibrate.app.api.core.models.snapshot import (
    SimplifiedSnapshotWithMetadata,
    SimplifiedSnapshotWithMetadataAndOutcomes,
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
    outcomes: dict[str, Any] = None,
) -> SimplifiedSnapshotWithMetadata:
    """Helper to create test snapshots.

    Args:
        id: Snapshot ID.
        name: Snapshot name.
        type_of_execution: "node" or "workflow".
        children: List of child snapshot IDs (for workflows).
        workflow_parent_id: Parent workflow ID (for child nodes).
        status: Snapshot status ("finished", "error", etc.).
        created_at: Creation timestamp.
        outcomes: Raw outcomes dict like {"q1": "successful", "q2": "failed"}.

    Returns:
        SimplifiedSnapshotWithMetadata (or WithOutcomes variant if outcomes provided).
    """
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

    if outcomes is not None:
        return SimplifiedSnapshotWithMetadataAndOutcomes(
            id=id,
            created_at=created_at or datetime.now(timezone.utc),
            parents=[id - 1] if id > 1 else [],
            metadata=metadata,
            outcomes=outcomes,
        )

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

    def test_items_with_workflow_parent_id_filtered_from_top_level(self):
        """Test that items with workflow_parent_id don't appear at top level.
        
        This handles the case where a child workflow is running but its parent
        workflow hasn't finished yet (so the parent isn't in the result set).
        """
        # Child snapshots without their parent workflow in the list
        snapshots = [
            create_snapshot(
                100,
                name="coherence_characterization",
                type_of_execution="workflow",
                children=[101, 102],
                workflow_parent_id=99,  # Parent 99 is NOT in the list
            ),
            create_snapshot(101, name="ramsey", workflow_parent_id=100),
            create_snapshot(102, name="t1", workflow_parent_id=100),
        ]

        result = build_snapshot_tree(snapshots)

        # None of these should appear at top level because they all have
        # workflow_parent_id set (meaning they belong to a parent workflow)
        assert len(result) == 0, \
            "Items with workflow_parent_id should not appear at top level"

    def test_standalone_items_appear_at_top_level(self):
        """Test that items without workflow_parent_id appear at top level."""
        snapshots = [
            create_snapshot(1, name="standalone_node"),  # No workflow_parent_id
            create_snapshot(
                2,
                name="standalone_workflow",
                type_of_execution="workflow",
                children=[],  # No children, just standalone
            ),
        ]

        result = build_snapshot_tree(snapshots)

        # Both should appear at top level
        assert len(result) == 2
        assert {item.id for item in result} == {1, 2}


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
        """Test pagination counts only top-level items, not nested children."""
        # Create a workflow with 2 children
        snapshots = [
            create_snapshot(1, type_of_execution="workflow", children=[2, 3]),
            create_snapshot(2),
            create_snapshot(3),
            create_snapshot(4),  # standalone
        ]

        tree = build_snapshot_tree(snapshots)

        # Total should be 2 (workflow + standalone) - children are nested inside workflow
        # and don't count as separate top-level items for pagination
        result, total = paginate_nested_items(tree, page=1, per_page=10)
        assert total == 2  # Only top-level items
        assert len(result) == 2  # workflow and standalone
        # Verify workflow has its children nested
        workflow = next(item for item in result if item.id == 1)
        assert workflow.items is not None
        assert len(workflow.items) == 2

    def test_per_page_returns_correct_top_level_count(self):
        """Test that per_page returns exactly that many top-level items.

        This tests the fix for the bug where requesting per_page=100 would
        return fewer top-level items because nested children were being
        counted towards the page limit.
        """
        # Create multiple workflows, each with children
        snapshots = []
        snapshot_id = 1
        for i in range(10):  # 10 workflows
            workflow_id = snapshot_id
            child_ids = [snapshot_id + 1, snapshot_id + 2]
            snapshots.append(
                create_snapshot(
                    workflow_id,
                    name=f"workflow_{i}",
                    type_of_execution="workflow",
                    children=child_ids,
                )
            )
            snapshots.append(
                create_snapshot(
                    child_ids[0],
                    name=f"child_{i}_1",
                    workflow_parent_id=workflow_id,
                )
            )
            snapshots.append(
                create_snapshot(
                    child_ids[1],
                    name=f"child_{i}_2",
                    workflow_parent_id=workflow_id,
                )
            )
            snapshot_id += 3

        tree = build_snapshot_tree(snapshots)

        # Request 5 items per page
        result, total = paginate_nested_items(tree, page=1, per_page=5)

        # Should get exactly 5 top-level workflows
        assert total == 10  # Total top-level items
        assert len(result) == 5  # Exactly 5 top-level items

        # Each workflow should have its 2 children nested
        for workflow in result:
            assert workflow.items is not None
            assert len(workflow.items) == 2

        # Test page 2
        result2, total2 = paginate_nested_items(tree, page=2, per_page=5)
        assert total2 == 10
        assert len(result2) == 5


class TestFetchMissingChildrenCallback:
    """Tests for fetch_missing_children callback in build_snapshot_tree."""

    def test_build_tree_with_fetch_callback(self):
        """Test that callback is called to fetch missing children."""
        # Create workflow that references children not in initial list
        initial_snapshots = [
            create_snapshot(
                1, name="workflow", type_of_execution="workflow", children=[2, 3]
            ),
        ]

        # Simulate callback that returns missing children
        missing_children = [
            create_snapshot(2, name="child1", workflow_parent_id=1),
            create_snapshot(3, name="child2", workflow_parent_id=1),
        ]
        callback_called = [False]
        requested_ids = [set()]

        def fetch_callback(ids):
            callback_called[0] = True
            requested_ids[0] = ids
            return missing_children

        result = build_snapshot_tree(initial_snapshots, fetch_missing_children=fetch_callback)

        assert callback_called[0], "Callback should have been called"
        assert requested_ids[0] == {2, 3}, "Should request IDs 2 and 3"
        assert len(result) == 1
        assert result[0].items is not None
        assert len(result[0].items) == 2

    def test_build_tree_without_callback(self):
        """Test that missing children are skipped without callback."""
        snapshots = [
            create_snapshot(
                1, name="workflow", type_of_execution="workflow", children=[2, 3, 99]
            ),
            create_snapshot(2, name="child1"),
            create_snapshot(3, name="child2"),
            # 99 is missing
        ]

        result = build_snapshot_tree(snapshots)

        # Only children 2 and 3 should be included
        assert len(result[0].items) == 2
        assert {item.id for item in result[0].items} == {2, 3}

    def test_recursive_fetch_for_nested_workflows(self):
        """Test that callback recursively fetches children of nested workflows."""
        initial = [
            create_snapshot(
                1, name="outer", type_of_execution="workflow", children=[2]
            ),
        ]

        # First fetch returns inner workflow, second fetch returns its children
        all_snapshots = {
            2: create_snapshot(
                2,
                name="inner",
                type_of_execution="workflow",
                children=[3],
                workflow_parent_id=1,
            ),
            3: create_snapshot(3, name="leaf", workflow_parent_id=2),
        }

        def fetch_callback(ids):
            return [all_snapshots[id] for id in ids if id in all_snapshots]

        result = build_snapshot_tree(initial, fetch_missing_children=fetch_callback)

        # Should have complete nested structure
        assert len(result) == 1
        assert result[0].id == 1
        assert result[0].items[0].id == 2
        assert result[0].items[0].items[0].id == 3


class TestOutcomesAggregation:
    """Tests for actual qubit outcomes aggregation."""

    def test_workflow_aggregates_actual_qubit_outcomes(self):
        """Test that workflow aggregates actual qubit outcomes from children."""
        snapshots = [
            create_snapshot(
                1,
                name="workflow",
                type_of_execution="workflow",
                children=[2, 3],
                status="finished",
            ),
            create_snapshot(
                2,
                name="node1",
                status="finished",
                outcomes={"q1": "successful", "q2": "successful"},
            ),
            create_snapshot(
                3,
                name="node2",
                status="error",
                outcomes={"q1": "successful", "q3": "failed"},
            ),
        ]

        result = build_snapshot_tree(snapshots)
        workflow = result[0]

        assert workflow.outcomes is not None
        # q1: successful in both nodes
        assert workflow.outcomes["q1"].status == "success"
        # q2: successful (only in node1)
        assert workflow.outcomes["q2"].status == "success"
        # q3: failed in node2
        assert workflow.outcomes["q3"].status == "failure"
        assert workflow.outcomes["q3"].failed_on == "node2"

    def test_failure_tracking_records_first_failure(self):
        """Test that failed_on records the first node where qubit failed."""
        snapshots = [
            create_snapshot(
                1,
                type_of_execution="workflow",
                children=[2, 3],
            ),
            create_snapshot(
                2,
                name="first_node",
                status="error",
                outcomes={"q1": "failed"},
            ),
            create_snapshot(
                3,
                name="second_node",
                status="error",
                outcomes={"q1": "failed"},  # Also failed, but first failure wins
            ),
        ]

        result = build_snapshot_tree(snapshots)
        workflow = result[0]

        assert workflow.outcomes["q1"].status == "failure"
        assert workflow.outcomes["q1"].failed_on == "first_node"

    def test_qubit_counts_from_actual_outcomes(self):
        """Test that qubit counts are based on actual outcomes."""
        snapshots = [
            create_snapshot(
                1,
                type_of_execution="workflow",
                children=[2],
            ),
            create_snapshot(
                2,
                name="node",
                status="error",
                outcomes={
                    "q1": "successful",
                    "q2": "successful",
                    "q3": "failed",
                    "q4": "failed",
                },
            ),
        ]

        result = build_snapshot_tree(snapshots)
        workflow = result[0]

        assert workflow.qubits_completed == 2
        assert workflow.qubits_total == 4

    def test_nested_workflow_outcomes_aggregation(self):
        """Test outcomes aggregation in nested workflows."""
        snapshots = [
            create_snapshot(
                1,
                name="outer",
                type_of_execution="workflow",
                children=[2],
            ),
            create_snapshot(
                2,
                name="inner",
                type_of_execution="workflow",
                children=[3, 4],
                workflow_parent_id=1,
            ),
            create_snapshot(
                3,
                name="leaf1",
                status="finished",
                outcomes={"q1": "successful"},
                workflow_parent_id=2,
            ),
            create_snapshot(
                4,
                name="leaf2",
                status="error",
                outcomes={"q1": "failed", "q2": "failed"},
                workflow_parent_id=2,
            ),
        ]

        result = build_snapshot_tree(snapshots)
        outer_workflow = result[0]
        inner_workflow = outer_workflow.items[0]

        # Inner workflow should have outcomes
        assert inner_workflow.outcomes is not None
        assert inner_workflow.outcomes["q1"].status == "success"  # First was success
        assert inner_workflow.outcomes["q2"].status == "failure"
        assert inner_workflow.outcomes["q2"].failed_on == "leaf2"

        # Outer workflow should also have aggregated outcomes
        assert outer_workflow.outcomes is not None
        assert outer_workflow.outcomes["q1"].status == "success"

    def test_workflow_without_outcomes_still_counts_nodes(self):
        """Test that node counting works even without outcomes data."""
        snapshots = [
            create_snapshot(
                1,
                type_of_execution="workflow",
                children=[2, 3],
            ),
            create_snapshot(2, name="node1", status="finished"),  # No outcomes
            create_snapshot(3, name="node2", status="error"),  # No outcomes
        ]

        result = build_snapshot_tree(snapshots)
        workflow = result[0]

        assert workflow.nodes_completed == 1
        assert workflow.nodes_total == 2
        # No qubit outcomes since no outcomes data
        assert workflow.qubits_total == 0


class TestConvertToHistoryItemWithOutcomes:
    """Tests for convert_to_history_item with raw outcomes."""

    def test_convert_with_raw_outcomes(self):
        """Test that raw outcomes are attached to the history item."""
        snapshot = create_snapshot(
            1,
            name="test",
            outcomes={"q1": "successful", "q2": "failed"},
        )

        result = convert_to_history_item(snapshot, raw_outcomes={"q1": "successful", "q2": "failed"})

        # Check that _raw_outcomes is attached (used during aggregation)
        assert hasattr(result, "_raw_outcomes")
        assert result._raw_outcomes == {"q1": "successful", "q2": "failed"}


class TestMetadataPreservation:
    """Tests for metadata field preservation through conversion.

    These tests verify that workflow-specific fields like type_of_execution
    and children are preserved correctly through the serialization chain.
    """

    def test_type_of_execution_preserved_in_metadata(self):
        """Test that type_of_execution field is preserved in SnapshotMetadata."""
        metadata_dict = {
            "name": "test_workflow",
            "status": "finished",
            "type_of_execution": "workflow",
            "children": [2, 3, 4],
        }
        metadata = SnapshotMetadata(**metadata_dict)

        # Verify the field is accessible via model_dump
        dumped = metadata.model_dump()
        assert dumped.get("type_of_execution") == "workflow"
        assert dumped.get("children") == [2, 3, 4]

    def test_children_field_preserved_in_metadata(self):
        """Test that children field is preserved as extra field."""
        metadata = SnapshotMetadata(
            name="workflow",
            status="finished",
        )
        # Manually set children (simulating how Pydantic handles extra fields)
        metadata.__pydantic_extra__ = {"children": [10, 20, 30], "type_of_execution": "workflow"}

        dumped = metadata.model_dump()
        assert dumped.get("children") == [10, 20, 30]

    def test_workflow_parent_id_preserved(self):
        """Test that workflow_parent_id field is preserved."""
        metadata_dict = {
            "name": "child_node",
            "status": "finished",
            "type_of_execution": "node",
            "workflow_parent_id": 100,
        }
        metadata = SnapshotMetadata(**metadata_dict)

        dumped = metadata.model_dump()
        assert dumped.get("workflow_parent_id") == 100

    def test_simplified_snapshot_preserves_metadata_fields(self):
        """Test that SimplifiedSnapshotWithMetadata preserves extra metadata fields."""
        snapshot = create_snapshot(
            1,
            name="nested_workflow",
            type_of_execution="workflow",
            children=[5, 6, 7],
            workflow_parent_id=0,
        )

        # Verify fields are accessible
        metadata_dict = snapshot.metadata.model_dump()
        assert metadata_dict.get("type_of_execution") == "workflow"
        assert metadata_dict.get("children") == [5, 6, 7]


class TestNestedWorkflowScenario:
    """Tests for the specific nested workflow scenario from 10_basic_graph_composition.

    This simulates the structure:
    - 10_basic_graph_composition (workflow)
      - 02_demo_rabi (node)
      - coherence_characterization (workflow)
        - 05_demo_ramsey (node)
        - 06_demo_t1 (node)
      - 07_demo_randomized_benchmarking (node)
    """

    def test_nested_workflow_recognized_as_workflow(self):
        """Test that nested workflow is correctly identified as workflow type."""
        snapshots = [
            create_snapshot(
                1,
                name="10_basic_graph_composition",
                type_of_execution="workflow",
                children=[2, 3, 6],
            ),
            create_snapshot(2, name="02_demo_rabi", workflow_parent_id=1, status="finished"),
            create_snapshot(
                3,
                name="coherence_characterization",
                type_of_execution="workflow",
                children=[4, 5],
                workflow_parent_id=1,
            ),
            create_snapshot(4, name="05_demo_ramsey", workflow_parent_id=3, status="finished"),
            create_snapshot(5, name="06_demo_t1", workflow_parent_id=3, status="finished"),
            create_snapshot(6, name="07_demo_randomized_benchmarking", workflow_parent_id=1, status="finished"),
        ]

        result = build_snapshot_tree(snapshots)

        # Verify structure
        assert len(result) == 1
        outer_workflow = result[0]
        assert outer_workflow.type_of_execution == ExecutionType.workflow
        assert len(outer_workflow.items) == 3

        # Find the nested workflow
        nested_workflow = None
        for item in outer_workflow.items:
            if item.metadata.name == "coherence_characterization":
                nested_workflow = item
                break

        assert nested_workflow is not None
        assert nested_workflow.type_of_execution == ExecutionType.workflow
        assert nested_workflow.items is not None
        assert len(nested_workflow.items) == 2

    def test_nested_workflow_fetched_via_callback(self):
        """Test that nested workflow children are fetched when not in initial query."""
        # Initial query only returns the outer workflow
        initial = [
            create_snapshot(
                1,
                name="10_basic_graph_composition",
                type_of_execution="workflow",
                children=[2, 3, 6],
            ),
        ]

        # All other snapshots need to be fetched
        all_snapshots = {
            2: create_snapshot(2, name="02_demo_rabi", workflow_parent_id=1, status="finished"),
            3: create_snapshot(
                3,
                name="coherence_characterization",
                type_of_execution="workflow",
                children=[4, 5],
                workflow_parent_id=1,
            ),
            4: create_snapshot(4, name="05_demo_ramsey", workflow_parent_id=3, status="finished"),
            5: create_snapshot(5, name="06_demo_t1", workflow_parent_id=3, status="finished"),
            6: create_snapshot(6, name="07_demo_randomized_benchmarking", workflow_parent_id=1, status="finished"),
        }

        fetch_calls = []

        def fetch_callback(ids):
            fetch_calls.append(set(ids))
            return [all_snapshots[id] for id in ids if id in all_snapshots]

        result = build_snapshot_tree(initial, fetch_missing_children=fetch_callback)

        # Should have called fetch at least twice:
        # 1. First to get children of outer workflow [2, 3, 6]
        # 2. Second to get children of nested workflow [4, 5]
        assert len(fetch_calls) >= 2
        assert {2, 3, 6} in fetch_calls
        assert {4, 5} in fetch_calls

        # Verify complete structure
        outer_workflow = result[0]
        assert len(outer_workflow.items) == 3

        nested_workflow = next(
            item for item in outer_workflow.items
            if item.metadata.name == "coherence_characterization"
        )
        assert nested_workflow.type_of_execution == ExecutionType.workflow
        assert len(nested_workflow.items) == 2

    def test_correct_node_counts_with_nested_workflow(self):
        """Test that node counts are correct for nested workflows.
        
        IMPORTANT: Subgraphs count as 1 node, NOT the sum of their internal nodes.
        """
        snapshots = [
            create_snapshot(
                1,
                name="10_basic_graph_composition",
                type_of_execution="workflow",
                children=[2, 3, 6],
            ),
            create_snapshot(2, name="02_demo_rabi", workflow_parent_id=1, status="finished"),
            create_snapshot(
                3,
                name="coherence_characterization",
                type_of_execution="workflow",
                children=[4, 5],
                workflow_parent_id=1,
            ),
            create_snapshot(4, name="05_demo_ramsey", workflow_parent_id=3, status="finished"),
            create_snapshot(5, name="06_demo_t1", workflow_parent_id=3, status="finished"),
            create_snapshot(6, name="07_demo_randomized_benchmarking", workflow_parent_id=1, status="finished"),
        ]

        result = build_snapshot_tree(snapshots)
        outer_workflow = result[0]

        # Outer workflow has 3 DIRECT children:
        # - rabi (node) = 1
        # - coherence_characterization (subgraph = 1, NOT 1+2)
        # - rb (node) = 1
        # Total = 3, NOT 5
        assert outer_workflow.nodes_total == 3
        assert outer_workflow.nodes_completed == 3  # All finished
        
        # The nested workflow (coherence_characterization) has 2 direct children
        nested_workflow = next(
            item for item in outer_workflow.items
            if item.metadata.name == "coherence_characterization"
        )
        assert nested_workflow.nodes_total == 2
        assert nested_workflow.nodes_completed == 2

    def test_outcomes_aggregation_with_nested_workflow(self):
        """Test outcomes are correctly aggregated from nested workflow."""
        snapshots = [
            create_snapshot(
                1,
                name="10_basic_graph_composition",
                type_of_execution="workflow",
                children=[2, 3, 6],
            ),
            create_snapshot(
                2,
                name="02_demo_rabi",
                workflow_parent_id=1,
                status="finished",
                outcomes={"q1": "successful", "q2": "successful"},
            ),
            create_snapshot(
                3,
                name="coherence_characterization",
                type_of_execution="workflow",
                children=[4, 5],
                workflow_parent_id=1,
            ),
            create_snapshot(
                4,
                name="05_demo_ramsey",
                workflow_parent_id=3,
                status="finished",
                outcomes={"q1": "successful", "q2": "failed"},
            ),
            create_snapshot(
                5,
                name="06_demo_t1",
                workflow_parent_id=3,
                status="error",
                outcomes={"q1": "failed", "q3": "successful"},
            ),
            create_snapshot(
                6,
                name="07_demo_randomized_benchmarking",
                workflow_parent_id=1,
                status="finished",
                outcomes={"q1": "successful", "q3": "successful"},
            ),
        ]

        result = build_snapshot_tree(snapshots)
        outer_workflow = result[0]

        # Check outcomes are aggregated
        assert outer_workflow.outcomes is not None
        # q1: successful in rabi, successful in ramsey, failed in t1, successful in rb
        # First occurrence wins for success, first failure wins for failure
        # q1 first appears as success in rabi, so success
        assert outer_workflow.outcomes["q1"].status == "success"
        # q2: successful in rabi, failed in ramsey -> first failure is ramsey
        assert outer_workflow.outcomes["q2"].status == "failure"
        assert outer_workflow.outcomes["q2"].failed_on == "05_demo_ramsey"
        # q3: successful in t1 first, then successful in rb
        assert outer_workflow.outcomes["q3"].status == "success"

        # Check nested workflow has its own outcomes
        nested_workflow = next(
            item for item in outer_workflow.items
            if item.metadata.name == "coherence_characterization"
        )
        assert nested_workflow.outcomes is not None

    def test_nested_workflow_items_not_null(self):
        """Test that nested workflow items field is properly populated."""
        snapshots = [
            create_snapshot(
                1,
                name="outer",
                type_of_execution="workflow",
                children=[2],
            ),
            create_snapshot(
                2,
                name="inner",
                type_of_execution="workflow",
                children=[3, 4],
                workflow_parent_id=1,
            ),
            create_snapshot(3, name="leaf1", workflow_parent_id=2),
            create_snapshot(4, name="leaf2", workflow_parent_id=2),
        ]

        result = build_snapshot_tree(snapshots)

        outer = result[0]
        inner = outer.items[0]

        # Inner workflow should have items, not null
        assert inner.items is not None, "Nested workflow items should not be null"
        assert len(inner.items) == 2
        assert {item.id for item in inner.items} == {3, 4}


class TestOnTheFlyWorkflowDetection:
    """Tests for on-the-fly workflow detection when type_of_execution is not set."""

    def test_detect_workflow_from_non_empty_children(self):
        """Test workflow detection when type_of_execution is missing but children exist."""
        # Create metadata without explicit type_of_execution
        metadata_dict = {
            "name": "implicit_workflow",
            "status": "finished",
            "children": [2, 3, 4],  # Has children but no type_of_execution
        }
        metadata = SnapshotMetadata(**metadata_dict)

        snapshot = SimplifiedSnapshotWithMetadata(
            id=1,
            created_at=datetime.now(timezone.utc),
            parents=[],
            metadata=metadata,
        )

        result = convert_to_history_item(snapshot)

        # Should be detected as workflow due to non-empty children
        assert result.type_of_execution == ExecutionType.workflow

    def test_detect_node_when_no_children(self):
        """Test node detection when type_of_execution is missing and no children."""
        metadata_dict = {
            "name": "implicit_node",
            "status": "finished",
            # No children, no type_of_execution
        }
        metadata = SnapshotMetadata(**metadata_dict)

        snapshot = SimplifiedSnapshotWithMetadata(
            id=1,
            created_at=datetime.now(timezone.utc),
            parents=[],
            metadata=metadata,
        )

        result = convert_to_history_item(snapshot)

        # Should be detected as node
        assert result.type_of_execution == ExecutionType.node

    def test_detect_node_when_empty_children_list(self):
        """Test node detection when children list is empty."""
        metadata_dict = {
            "name": "node_with_empty_children",
            "status": "finished",
            "children": [],  # Empty list
        }
        metadata = SnapshotMetadata(**metadata_dict)

        snapshot = SimplifiedSnapshotWithMetadata(
            id=1,
            created_at=datetime.now(timezone.utc),
            parents=[],
            metadata=metadata,
        )

        result = convert_to_history_item(snapshot)

        # Should be detected as node (empty children = not a workflow)
        assert result.type_of_execution == ExecutionType.node

    def test_explicit_type_takes_precedence_when_no_children(self):
        """Test that explicit type_of_execution takes precedence when no children."""
        # Workflow with explicit type but no children
        metadata_dict = {
            "name": "explicit_workflow",
            "status": "finished",
            "type_of_execution": "workflow",
            "children": [],  # Empty, but type is explicit
        }
        metadata = SnapshotMetadata(**metadata_dict)

        snapshot = SimplifiedSnapshotWithMetadata(
            id=1,
            created_at=datetime.now(timezone.utc),
            parents=[],
            metadata=metadata,
        )

        result = convert_to_history_item(snapshot)

        # Should respect explicit type when no children
        assert result.type_of_execution == ExecutionType.workflow

    def test_children_override_incorrect_node_type(self):
        """Test that having children overrides incorrect 'node' type (the bug fix).
        
        This tests the exact scenario from 10_basic_graph_composition where
        coherence_characterization was saved with type_of_execution='node' 
        but has children=[1304, 1305], so it should be treated as a workflow.
        """
        # Create metadata that incorrectly says "node" but has children
        metadata_dict = {
            "name": "coherence_characterization",
            "status": "finished",
            "type_of_execution": "node",  # Incorrectly set as node!
            "children": [1304, 1305],      # But it HAS children!
            "workflow_parent_id": 1301,
        }
        metadata = SnapshotMetadata(**metadata_dict)

        snapshot = SimplifiedSnapshotWithMetadata(
            id=1303,
            created_at=datetime.now(timezone.utc),
            parents=[1302],
            metadata=metadata,
        )

        result = convert_to_history_item(snapshot)

        # Should be detected as WORKFLOW because it has children,
        # regardless of the incorrect "node" type in metadata
        assert result.type_of_execution == ExecutionType.workflow
        assert result.metadata.children == [1304, 1305]

    def test_tree_building_with_incorrectly_typed_nested_workflow(self):
        """Test full tree building with incorrectly typed nested workflow.
        
        This simulates the exact 10_basic_graph_composition bug where:
        - coherence_characterization is saved as type_of_execution="node"
        - But it has children [1304, 1305]
        - The tree builder should detect it as a workflow and populate items
        """
        snapshots = [
            create_snapshot(
                1301,
                name="10_basic_graph_composition",
                type_of_execution="workflow",
                children=[1302, 1303, 1306],
            ),
            create_snapshot(
                1302,
                name="02_demo_rabi",
                type_of_execution="node",
                workflow_parent_id=1301,
                status="finished",
            ),
            # This is the problematic nested workflow - type says "node" but has children
            create_snapshot(
                1303,
                name="coherence_characterization",
                type_of_execution="node",  # BUG: incorrectly set as node
                children=[1304, 1305],      # But it HAS children
                workflow_parent_id=1301,
                status="finished",
            ),
            create_snapshot(
                1304,
                name="05_demo_ramsey",
                type_of_execution="node",
                workflow_parent_id=1303,
                status="finished",
            ),
            create_snapshot(
                1305,
                name="06_demo_t1",
                type_of_execution="node",
                workflow_parent_id=1303,
                status="finished",
            ),
            create_snapshot(
                1306,
                name="07_demo_randomized_benchmarking",
                type_of_execution="node",
                workflow_parent_id=1301,
                status="finished",
            ),
        ]

        result = build_snapshot_tree(snapshots)

        # Verify top-level structure
        assert len(result) == 1
        outer_workflow = result[0]
        assert outer_workflow.id == 1301
        assert outer_workflow.type_of_execution == ExecutionType.workflow
        assert len(outer_workflow.items) == 3

        # Find the nested workflow (coherence_characterization)
        nested_workflow = None
        for item in outer_workflow.items:
            if item.id == 1303:
                nested_workflow = item
                break

        # The key assertion: despite being stored as "node", it should be
        # detected as workflow because it has children
        assert nested_workflow is not None
        assert nested_workflow.type_of_execution == ExecutionType.workflow, \
            "coherence_characterization should be detected as workflow because it has children"
        
        # Its items should be populated with the children
        assert nested_workflow.items is not None, \
            "Nested workflow items should not be null"
        assert len(nested_workflow.items) == 2
        assert {item.id for item in nested_workflow.items} == {1304, 1305}

        # Verify node counts are correct
        # Subgraphs count as 1 node, so outer workflow has 3 direct children:
        # - rabi (node) = 1
        # - coherence_characterization (subgraph = 1)
        # - rb (node) = 1
        # Total = 3, NOT 5 (subgraphs don't count their internal nodes)
        assert outer_workflow.nodes_total == 3
        assert outer_workflow.nodes_completed == 3
        
        # Nested workflow has 2 direct children
        assert nested_workflow.nodes_total == 2
        assert nested_workflow.nodes_completed == 2
