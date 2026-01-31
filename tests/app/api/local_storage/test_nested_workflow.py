"""Tests for nested workflow structure models in /snapshots_history endpoint."""

from qualibrate.app.api.core.models.snapshot import (
    ExecutionType,
    QubitOutcome,
    SnapshotHistoryItem,
    SnapshotHistoryMetadata,
)


class TestQubitOutcomeModel:
    """Tests for QubitOutcome model."""

    def test_success_outcome(self) -> None:
        """Test creating a success outcome."""
        outcome = QubitOutcome(status="success")
        assert outcome.status == "success"
        assert outcome.failed_on is None

    def test_failure_outcome(self) -> None:
        """Test creating a failure outcome with failed_on."""
        outcome = QubitOutcome(status="failure", failed_on="node_123")
        assert outcome.status == "failure"
        assert outcome.failed_on == "node_123"

    def test_outcome_serialization(self) -> None:
        """Test outcome serializes to dict correctly."""
        outcome = QubitOutcome(status="failure", failed_on="test_node")
        data = outcome.model_dump()
        assert data == {"status": "failure", "failed_on": "test_node"}


class TestExecutionTypeEnum:
    """Tests for ExecutionType enum."""

    def test_node_type(self) -> None:
        """Test node execution type."""
        assert ExecutionType.node.value == "node"
        assert ExecutionType("node") == ExecutionType.node

    def test_workflow_type(self) -> None:
        """Test workflow execution type."""
        assert ExecutionType.workflow.value == "workflow"
        assert ExecutionType("workflow") == ExecutionType.workflow

    def test_enum_string_comparison(self) -> None:
        """Test enum can be compared to string."""
        assert ExecutionType.node == "node"
        assert ExecutionType.workflow == "workflow"


class TestSnapshotHistoryMetadata:
    """Tests for SnapshotHistoryMetadata model."""

    def test_node_metadata(self) -> None:
        """Test creating metadata for a node."""
        metadata = SnapshotHistoryMetadata(
            name="test_node",
            status="finished",
            type_of_execution=ExecutionType.node,
        )
        assert metadata.name == "test_node"
        assert metadata.status == "finished"
        assert metadata.type_of_execution == ExecutionType.node
        assert metadata.children is None
        assert metadata.workflow_parent_id is None

    def test_workflow_metadata(self) -> None:
        """Test creating metadata for a workflow."""
        metadata = SnapshotHistoryMetadata(
            name="test_workflow",
            status="finished",
            type_of_execution=ExecutionType.workflow,
            children=[2, 3, 4],
        )
        assert metadata.name == "test_workflow"
        assert metadata.type_of_execution == ExecutionType.workflow
        assert metadata.children == [2, 3, 4]

    def test_child_metadata_with_parent(self) -> None:
        """Test creating metadata for a child node with parent ID."""
        metadata = SnapshotHistoryMetadata(
            name="child_node",
            status="finished",
            type_of_execution=ExecutionType.node,
            workflow_parent_id=1,
        )
        assert metadata.workflow_parent_id == 1

    def test_default_type_of_execution(self) -> None:
        """Test default type_of_execution is node."""
        metadata = SnapshotHistoryMetadata(name="test")
        assert metadata.type_of_execution == ExecutionType.node


class TestSnapshotHistoryItem:
    """Tests for SnapshotHistoryItem model."""

    def test_create_node_item(self) -> None:
        """Test creating a node item."""
        item = SnapshotHistoryItem(
            id=1,
            created_at="2025-01-01T12:00:00+00:00",
            parents=[],
            metadata=SnapshotHistoryMetadata(
                name="test_node",
                type_of_execution=ExecutionType.node,
            ),
            type_of_execution=ExecutionType.node,
        )

        assert item.id == 1
        assert item.type_of_execution == ExecutionType.node
        assert item.items is None
        assert item.outcomes is None
        assert item.nodes_completed is None
        assert item.nodes_total is None
        assert item.qubits_completed is None
        assert item.qubits_total is None

    def test_create_workflow_item_with_aggregates(self) -> None:
        """Test creating a workflow item with all aggregate fields."""
        item = SnapshotHistoryItem(
            id=1,
            created_at="2025-01-01T12:00:00+00:00",
            parents=[],
            metadata=SnapshotHistoryMetadata(
                name="test_workflow",
                type_of_execution=ExecutionType.workflow,
                children=[2, 3],
            ),
            type_of_execution=ExecutionType.workflow,
            items=[],
            outcomes={
                "q1": QubitOutcome(status="success"),
                "q2": QubitOutcome(status="failure", failed_on="node_3"),
            },
            nodes_completed=2,
            nodes_total=3,
            qubits_completed=1,
            qubits_total=2,
        )

        assert item.id == 1
        assert item.type_of_execution == ExecutionType.workflow
        assert item.items == []
        assert item.outcomes is not None
        assert len(item.outcomes) == 2
        assert item.outcomes["q1"].status == "success"
        assert item.outcomes["q2"].status == "failure"
        assert item.outcomes["q2"].failed_on == "node_3"
        assert item.nodes_completed == 2
        assert item.nodes_total == 3
        assert item.qubits_completed == 1
        assert item.qubits_total == 2

    def test_create_nested_workflow(self) -> None:
        """Test creating a workflow with nested children."""
        child1 = SnapshotHistoryItem(
            id=2,
            created_at="2025-01-01T12:01:00+00:00",
            parents=[1],
            metadata=SnapshotHistoryMetadata(
                name="child_node_1",
                status="finished",
                type_of_execution=ExecutionType.node,
            ),
            type_of_execution=ExecutionType.node,
        )

        child2 = SnapshotHistoryItem(
            id=3,
            created_at="2025-01-01T12:02:00+00:00",
            parents=[2],
            metadata=SnapshotHistoryMetadata(
                name="child_node_2",
                status="error",
                type_of_execution=ExecutionType.node,
            ),
            type_of_execution=ExecutionType.node,
        )

        workflow = SnapshotHistoryItem(
            id=1,
            created_at="2025-01-01T12:00:00+00:00",
            parents=[],
            metadata=SnapshotHistoryMetadata(
                name="test_workflow",
                type_of_execution=ExecutionType.workflow,
                children=[2, 3],
            ),
            type_of_execution=ExecutionType.workflow,
            items=[child1, child2],
        )

        assert workflow.items is not None
        assert len(workflow.items) == 2
        assert workflow.items[0].id == 2
        assert workflow.items[0].metadata.name == "child_node_1"
        assert workflow.items[1].id == 3
        assert workflow.items[1].metadata.status == "error"

    def test_deeply_nested_workflow(self) -> None:
        """Test creating a workflow with nested sub-workflow."""
        # Create a leaf node
        leaf_node = SnapshotHistoryItem(
            id=4,
            created_at="2025-01-01T12:03:00+00:00",
            parents=[3],
            metadata=SnapshotHistoryMetadata(
                name="leaf_node",
                status="finished",
                type_of_execution=ExecutionType.node,
            ),
            type_of_execution=ExecutionType.node,
        )

        # Create a sub-workflow containing the leaf
        sub_workflow = SnapshotHistoryItem(
            id=3,
            created_at="2025-01-01T12:02:00+00:00",
            parents=[1],
            metadata=SnapshotHistoryMetadata(
                name="sub_workflow",
                type_of_execution=ExecutionType.workflow,
                children=[4],
            ),
            type_of_execution=ExecutionType.workflow,
            items=[leaf_node],
            nodes_completed=1,
            nodes_total=1,
        )

        # Create a node sibling
        node_sibling = SnapshotHistoryItem(
            id=2,
            created_at="2025-01-01T12:01:00+00:00",
            parents=[1],
            metadata=SnapshotHistoryMetadata(
                name="node_sibling",
                status="finished",
                type_of_execution=ExecutionType.node,
            ),
            type_of_execution=ExecutionType.node,
        )

        # Create the top-level workflow
        top_workflow = SnapshotHistoryItem(
            id=1,
            created_at="2025-01-01T12:00:00+00:00",
            parents=[],
            metadata=SnapshotHistoryMetadata(
                name="top_workflow",
                type_of_execution=ExecutionType.workflow,
                children=[2, 3],
            ),
            type_of_execution=ExecutionType.workflow,
            items=[node_sibling, sub_workflow],
            nodes_completed=2,
            nodes_total=3,
        )

        # Verify structure
        assert top_workflow.items is not None
        assert len(top_workflow.items) == 2
        assert top_workflow.items[0].type_of_execution == ExecutionType.node
        assert top_workflow.items[1].type_of_execution == ExecutionType.workflow
        assert top_workflow.items[1].items is not None
        assert len(top_workflow.items[1].items) == 1
        assert top_workflow.items[1].items[0].id == 4

    def test_item_with_tags(self) -> None:
        """Test creating an item with tags."""
        item = SnapshotHistoryItem(
            id=1,
            created_at="2025-01-01T12:00:00+00:00",
            parents=[],
            metadata=SnapshotHistoryMetadata(
                name="tagged_node",
                type_of_execution=ExecutionType.node,
            ),
            type_of_execution=ExecutionType.node,
            tags=["calibration", "resonance", "quick-check"],
        )

        assert item.tags is not None
        assert len(item.tags) == 3
        assert "calibration" in item.tags

    def test_item_serialization(self) -> None:
        """Test that item serializes correctly to dict."""
        item = SnapshotHistoryItem(
            id=1,
            created_at="2025-01-01T12:00:00+00:00",
            parents=[0],
            metadata=SnapshotHistoryMetadata(
                name="test_node",
                status="finished",
                type_of_execution=ExecutionType.node,
            ),
            type_of_execution=ExecutionType.node,
        )

        data = item.model_dump()

        assert data["id"] == 1
        assert data["type_of_execution"] == "node"
        assert data["parents"] == [0]
        assert data["metadata"]["name"] == "test_node"
        assert data["metadata"]["status"] == "finished"
        assert data["items"] is None


class TestWorkflowAggregates:
    """Tests for workflow aggregate computations."""

    def test_workflow_with_all_success(self) -> None:
        """Test workflow where all children succeed."""
        workflow = SnapshotHistoryItem(
            id=1,
            created_at="2025-01-01T12:00:00+00:00",
            parents=[],
            metadata=SnapshotHistoryMetadata(
                name="success_workflow",
                type_of_execution=ExecutionType.workflow,
            ),
            type_of_execution=ExecutionType.workflow,
            outcomes={
                "q1": QubitOutcome(status="success"),
                "q2": QubitOutcome(status="success"),
                "q3": QubitOutcome(status="success"),
            },
            nodes_completed=3,
            nodes_total=3,
            qubits_completed=3,
            qubits_total=3,
        )

        assert workflow.nodes_completed == workflow.nodes_total
        assert workflow.qubits_completed == workflow.qubits_total
        assert all(o.status == "success" for o in workflow.outcomes.values())

    def test_workflow_with_failures(self) -> None:
        """Test workflow with some failures."""
        workflow = SnapshotHistoryItem(
            id=1,
            created_at="2025-01-01T12:00:00+00:00",
            parents=[],
            metadata=SnapshotHistoryMetadata(
                name="mixed_workflow",
                type_of_execution=ExecutionType.workflow,
            ),
            type_of_execution=ExecutionType.workflow,
            outcomes={
                "q1": QubitOutcome(status="success"),
                "q2": QubitOutcome(status="failure", failed_on="node_2"),
                "q3": QubitOutcome(status="failure", failed_on="node_3"),
            },
            nodes_completed=1,
            nodes_total=3,
            qubits_completed=1,
            qubits_total=3,
        )

        assert workflow.nodes_completed < workflow.nodes_total
        assert workflow.qubits_completed < workflow.qubits_total
        assert workflow.outcomes["q2"].failed_on == "node_2"
        assert workflow.outcomes["q3"].failed_on == "node_3"

    def test_empty_workflow(self) -> None:
        """Test workflow with no children."""
        workflow = SnapshotHistoryItem(
            id=1,
            created_at="2025-01-01T12:00:00+00:00",
            parents=[],
            metadata=SnapshotHistoryMetadata(
                name="empty_workflow",
                type_of_execution=ExecutionType.workflow,
            ),
            type_of_execution=ExecutionType.workflow,
            items=[],
            outcomes={},
            nodes_completed=0,
            nodes_total=0,
            qubits_completed=0,
            qubits_total=0,
        )

        assert workflow.items == []
        assert workflow.outcomes == {}
        assert workflow.nodes_total == 0
