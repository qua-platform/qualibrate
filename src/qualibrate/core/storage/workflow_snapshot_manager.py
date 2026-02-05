from datetime import datetime
from pathlib import Path
from typing import TYPE_CHECKING, Any, cast

from qualibrate.core.models.execution_type import ExecutionType
from qualibrate.core.models.outcome import Outcome
from qualibrate.core.storage.snapshot_json_handler import SnapshotJsonHandler
from qualibrate.core.utils.logger_m import logger

if TYPE_CHECKING:
    from qualang_tools.results import DataHandler

    from qualibrate.core.qualibration_graph import QualibrationGraph

__all__ = ["WorkflowSnapshotManager"]


class WorkflowSnapshotManager:
    """Manages workflow snapshot lifecycle independent of orchestrator.

    This class handles the creation, tracking, and finalization of
    workflow snapshots, decoupling storage concerns from the orchestrator.

    Args:
        root_data_folder: The root folder where data should be saved.
        data_handler: DataHandler instance for creating snapshots.
    """

    def __init__(
        self,
        root_data_folder: Path,
        data_handler: "DataHandler",
    ):
        self.root_data_folder = root_data_folder
        self.data_handler = data_handler
        self.json_handler = SnapshotJsonHandler(root_data_folder)

    def _clean_data_handler(self) -> None:
        """Reset data handler path state."""
        self.data_handler.path = None
        self.data_handler.path_properties = None

    def start_workflow_snapshot(
        self,
        graph: "QualibrationGraph[Any]",
        workflow_parent_id: int | None = None,
    ) -> int:
        """Create a workflow snapshot at the start of graph execution.

        Args:
            graph: The QualibrationGraph being executed.
            workflow_parent_id: ID of parent workflow if this is a nested graph.

        Returns:
            The snapshot ID of the created workflow snapshot.
        """
        logger.info(f"Saving workflow snapshot start for {graph.name}")

        self.data_handler.name = graph.name
        self._clean_data_handler()

        run_start = datetime.now().astimezone()

        # Prepare workflow node data
        self.data_handler.node_data = {
            "parameters": {
                "model": (
                    graph.full_parameters.model_dump(mode="json")
                    if graph.full_parameters
                    else {}
                ),
            },
            "outcomes": {},
        }

        metadata: dict[str, Any] = {
            "description": graph.description,
            "run_start": run_start.isoformat(timespec="milliseconds"),
            "type_of_execution": ExecutionType.workflow.value,
            "children": [],  # Will be populated as child nodes complete
            "status": "running",
        }
        if workflow_parent_id is not None:
            metadata["workflow_parent_id"] = workflow_parent_id

        node_contents = self.data_handler.generate_node_contents(metadata=metadata)
        self.data_handler.save_data(
            data={},
            name=graph.name,
            node_contents=node_contents,
        )
        snapshot_idx = cast(int, node_contents["id"])
        logger.info(f"Created workflow snapshot {snapshot_idx} for {graph.name}")
        return snapshot_idx

    def finalize_workflow_snapshot(
        self,
        graph: "QualibrationGraph[Any]",
        workflow_snapshot_idx: int,
        children_ids: list[int],
        outcomes: dict[str, Any],
        status: str = "finished",
    ) -> bool:
        """Update a workflow snapshot at the end of graph execution.

        Args:
            graph: The QualibrationGraph that finished executing.
            workflow_snapshot_idx: The snapshot ID of the workflow to update.
            children_ids: List of child snapshot IDs.
            outcomes: Aggregated outcomes from the workflow execution.
            status: Final status of the workflow ("finished" or "error").

        Returns:
            True if update succeeded, False otherwise.
        """
        logger.info(
            f"Finalizing workflow snapshot {workflow_snapshot_idx} for {graph.name}"
        )

        node_json_path = self.json_handler.get_node_json_path(workflow_snapshot_idx)
        if node_json_path is None:
            return False

        content = self.json_handler.read_node_json(node_json_path)
        if content is None:
            return False

        run_end = datetime.now().astimezone()

        # Update metadata
        if "metadata" not in content:
            content["metadata"] = {}
        content["metadata"]["run_end"] = run_end.isoformat(timespec="milliseconds")
        content["metadata"]["children"] = children_ids
        content["metadata"]["status"] = status

        # Update outcomes in data
        if "data" not in content:
            content["data"] = {}
        content["data"]["outcomes"] = {
            k: v.value if isinstance(v, Outcome) else v for k, v in outcomes.items()
        }

        success = self.json_handler.write_node_json(node_json_path, content)
        if success:
            logger.info(
                f"Finalized workflow snapshot {workflow_snapshot_idx} "
                f"for graph {graph.name} with status {status}"
            )
        return success

    def track_child_snapshot(
        self,
        workflow_snapshot_idx: int,
        child_id: int,
    ) -> bool:
        """Append a child snapshot ID to a workflow's children list.

        Args:
            workflow_snapshot_idx: The workflow snapshot ID to update.
            child_id: The child snapshot ID to add.

        Returns:
            True if update succeeded, False otherwise.
        """
        node_json_path = self.json_handler.get_node_json_path(workflow_snapshot_idx)
        if node_json_path is None:
            return False

        content = self.json_handler.read_node_json(node_json_path)
        if content is None:
            return False

        # Ensure metadata and children exist
        if "metadata" not in content:
            content["metadata"] = {}
        if "children" not in content["metadata"]:
            content["metadata"]["children"] = []

        # Append child if not already present
        if child_id not in content["metadata"]["children"]:
            content["metadata"]["children"].append(child_id)

        return self.json_handler.write_node_json(node_json_path, content)

    def set_snapshot_workflow_parent(
        self,
        snapshot_idx: int,
        workflow_parent_id: int,
    ) -> bool:
        """Set the workflow_parent_id for a snapshot.

        Args:
            snapshot_idx: The snapshot ID to update.
            workflow_parent_id: The parent workflow's snapshot ID.

        Returns:
            True if update succeeded, False otherwise.
        """
        node_json_path = self.json_handler.get_node_json_path(snapshot_idx)
        if node_json_path is None:
            return False

        content = self.json_handler.read_node_json(node_json_path)
        if content is None:
            return False

        # Ensure metadata exists and set workflow_parent_id
        if "metadata" not in content:
            content["metadata"] = {}
        content["metadata"]["workflow_parent_id"] = workflow_parent_id
        # Only set type_of_execution to node if not already set
        # (preserves workflow type for nested subgraphs)
        if "type_of_execution" not in content["metadata"]:
            content["metadata"]["type_of_execution"] = ExecutionType.node.value

        return self.json_handler.write_node_json(node_json_path, content)
