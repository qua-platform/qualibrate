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
        self.data_handler.save_data(data=node.results, name=node.name)

        # Save QuAM
        if node.machine is None:
            logger.info("Node has no QuAM, skipping machine.save")

        # Save QuAM to the data folder
        node.machine.save(
            path=Path(self.data_handler.path) / "quam_state.json"
        )  # TODO Verify that Path is unnecessary
