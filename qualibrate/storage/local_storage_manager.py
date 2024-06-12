from pathlib import Path
from .storage_manager import StorageManager
import logging
from qualang_tools.results import DataHandler

logger = logging.getLogger(__name__)


class LocalStorageManager(StorageManager):
    def __init__(self, root_data_folder: Path):
        self.root_data_folder = root_data_folder
        self.data_handler = DataHandler(root_data_folder=root_data_folder)
        self.snapshot_idx = None

    def save(self, node):
        logger.info(f"Saving node {node.name} to local storage")

        # Save results
        node_contents = (
            self.data_handler.generate_node_contents()
        )  # TODO directly access idx
        self.data_handler.save_data(
            data=node.results, name=node.name, node_contents=node_contents
        )
        self.snapshot_idx = node_contents["id"]

        # Save QuAM
        if node.machine is None:
            logger.info("Node has no QuAM, skipping machine.save")

        # Save QuAM to the data folder
        assert isinstance(self.data_handler.path, Path)  # TODO Remove assertion
        node.machine.save(path=self.data_handler.path / "quam_state.json")
