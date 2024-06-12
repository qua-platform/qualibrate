import logging
from pathlib import Path
from typing import Any, Dict, Mapping, Optional

from qualibrate import NodeParameters
from qualibrate.qualibration_node import QualibrationNode, StopInspection

logger = logging.getLogger(__name__)


def file_is_calibration_node(file: Path):
    if not file.is_file():
        return False
    if file.suffix != ".py":
        return False

    contents = file.read_text()
    if "QualibrationNode(" not in contents:
        return False
    return True


class QualibrationLibrary:
    active_library: Optional["QualibrationLibrary"] = None

    def __init__(self, library_folder: Optional[Path] = None, set_active=True):
        self.nodes: Dict[str, QualibrationNode] = {}

        if set_active:
            QualibrationLibrary.active_library = self

        if library_folder:
            self.scan_folder_for_nodes(library_folder)

    def scan_folder_for_nodes(self, path: Path, append=False):
        if isinstance(path, str):
            path = Path(path)

        if not append:
            self.nodes = {}

        original_mode = QualibrationNode.mode
        try:
            QualibrationNode.mode = "inspection"

            for file in sorted(path.iterdir()):
                if not file_is_calibration_node(file):
                    continue
                self.scan_node_file(file)
        finally:
            QualibrationNode.mode = original_mode

    def scan_node_file(self, file: Path):
        logger.info(f"Scanning node file {file}")
        with file.open() as f:
            code = f.read()

        try:
            # TODO Think of a safer way to execute the code
            exec(code)
        except StopInspection:
            node = QualibrationNode.last_instantiated_node
            QualibrationLibrary.last_instantiated_node = None

            if node is None:
                logger.warning(f"No node instantiated in file {file}")
                return

            node.node_filepath = file
            self.add_node(node)

    def add_node(self, node):
        if node.name in self.nodes:
            logger.warning(f'Node "{node.name}" already exists in library, overwriting')

        self.nodes[node.name] = node

    def serialize(self) -> Mapping[str, Any]:
        return {"nodes": [node.serialize() for node in self.nodes.values()]}

    def get_nodes(self) -> Mapping[str, QualibrationNode]:
        return self.nodes

    def run_node(self, node_name: str, input_parameters: NodeParameters):
        node = self.nodes[node_name]
        node.run_node(input_parameters)
