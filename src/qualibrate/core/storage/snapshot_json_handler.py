"""Utility class for handling snapshot JSON file operations.

This module provides a reusable handler for reading and writing
node.json files in the local storage format.
"""

import json
from pathlib import Path
from typing import TYPE_CHECKING

from qualibrate.core.utils.logger_m import logger

if TYPE_CHECKING:
    from typing import Any

__all__ = ["SnapshotJsonHandler"]


class SnapshotJsonHandler:
    """Handles JSON file operations for snapshots.

    Provides methods for finding, reading, and writing node.json files
    in the local storage directory structure.

    Args:
        root_data_folder: The root folder where snapshot data is stored.
    """

    def __init__(self, root_data_folder: Path):
        self.root_data_folder = root_data_folder

    def get_node_json_path(self, snapshot_idx: int) -> Path | None:
        """Get the path to a snapshot's node.json file by snapshot ID.

        Searches for a snapshot directory matching the ID pattern
        in the root data folder.

        Args:
            snapshot_idx: The snapshot ID to find.

        Returns:
            Path to the node.json file, or None if not found.
        """
        # Search for the snapshot directory using the ID pattern
        pattern = f"*/#{snapshot_idx}_*"
        matches = list(self.root_data_folder.glob(pattern))
        if not matches:
            logger.warning(
                f"Snapshot {snapshot_idx} not found in {self.root_data_folder}"
            )
            return None
        return matches[0] / "node.json"

    def read_node_json(self, node_json_path: Path) -> dict[str, "Any"] | None:
        """Read and parse a node.json file.

        Args:
            node_json_path: Path to the node.json file.

        Returns:
            Parsed JSON content as a dictionary, or None if read fails.
        """
        if not node_json_path.is_file():
            logger.warning(f"node.json not found at {node_json_path}")
            return None
        try:
            with node_json_path.open("r") as f:
                return dict(json.load(f))
        except json.JSONDecodeError as ex:
            logger.exception(f"Failed to parse {node_json_path}", exc_info=ex)
            return None

    def write_node_json(
        self, node_json_path: Path, content: dict[str, "Any"]
    ) -> bool:
        """Write content to a node.json file.

        Args:
            node_json_path: Path to the node.json file.
            content: Content to write as JSON.

        Returns:
            True if write succeeded, False otherwise.
        """
        try:
            with node_json_path.open("w") as f:
                json.dump(content, f, indent=2, default=str)
            return True
        except Exception as ex:
            logger.exception(f"Failed to write {node_json_path}", exc_info=ex)
            return False

    def read_snapshot(self, snapshot_idx: int) -> dict[str, "Any"] | None:
        """Read a snapshot's node.json content by its ID.

        Convenience method that combines get_node_json_path and read_node_json.

        Args:
            snapshot_idx: The snapshot ID to read.

        Returns:
            Parsed JSON content, or None if not found or read fails.
        """
        path = self.get_node_json_path(snapshot_idx)
        if path is None:
            return None
        return self.read_node_json(path)

    def write_snapshot(
        self, snapshot_idx: int, content: dict[str, "Any"]
    ) -> bool:
        """Write content to a snapshot's node.json file by its ID.

        Convenience method that combines get_node_json_path and write_node_json.

        Args:
            snapshot_idx: The snapshot ID to write to.
            content: Content to write as JSON.

        Returns:
            True if write succeeded, False otherwise.
        """
        path = self.get_node_json_path(snapshot_idx)
        if path is None:
            return False
        return self.write_node_json(path, content)
