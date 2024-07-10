import json
import logging
from pathlib import Path
from typing import TYPE_CHECKING, Optional

from qualang_tools.results import DataHandler

from qualibrate.storage.storage_manager import StorageManager

if TYPE_CHECKING:
    from qualibrate.qualibration_node import QualibrationNode

logger = logging.getLogger(__name__)


class LocalStorageManager(StorageManager):
    machine_content_mapping = {"wiring.json": {"wiring", "network"}}

    def __init__(
        self, root_data_folder: Path, active_machine_path: Optional[Path] = None
    ):
        self.root_data_folder = root_data_folder
        self.data_handler = DataHandler(root_data_folder=root_data_folder)
        self.active_machine_path = active_machine_path
        self.snapshot_idx = None

    def save(self, node: "QualibrationNode") -> None:
        logger.info(f"Saving node {node.name} to local storage")

        # Save results
        self.data_handler.name = node.name
        DataHandler.node_data = {"quam": "./quam_state.json"}
        node_contents = (
            self.data_handler.generate_node_contents()
        )  # TODO directly access idx
        self.data_handler.save_data(
            data=node.results,
            name=node.name,
            node_contents=node_contents,
        )
        self.snapshot_idx = node_contents["id"]

        if node.machine is None:
            logger.info("Node has no QuAM, skipping machine.save")
            return

        assert isinstance(self.data_handler.path, Path)  # TODO Remove assertion

        if self.machine_content_mapping is None:
            content_mapping = None
        elif all(
            hasattr(node.machine, elem)
            for elem_group in self.machine_content_mapping.values()
            for elem in elem_group
        ):
            content_mapping = self.machine_content_mapping
        else:
            content_mapping = None

        # Save QuAM to the data folder
        if isinstance(node.machine, dict):
            quam_path = self.data_handler.path / "quam_state2.json"
            quam_path.write_text(
                json.dumps(node.machine, indent=4, sort_keys=True)
            )
        else:
            # Save as single file
            node.machine.save(path=self.data_handler.path / "quam_state.json")
            # Save as folder with wiring and network separated
            if content_mapping is not None:
                node.machine.save(
                    path=self.data_handler.path / "quam_state",
                    content_mapping=content_mapping,
                )

        # Optionally also save QuAM to the active path
        if self.active_machine_path is not None:
            print(f"Saving machine to active path {self.active_machine_path}")
            node.machine.save(
                path=self.active_machine_path,
                content_mapping=content_mapping,
            )
