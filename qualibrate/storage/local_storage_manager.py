import importlib
from datetime import datetime
from pathlib import Path
from typing import (
    TYPE_CHECKING,
    Generic,
    TypeVar,
)

from packaging.version import Version
from qualang_tools.results import DataHandler

from qualibrate.models.outcome import Outcome
from qualibrate.storage.storage_manager import StorageManager
from qualibrate.utils.logger_m import logger
from qualibrate.utils.type_protocols import MachineProtocol

if TYPE_CHECKING:
    from typing import Any

    from qualibrate.qualibration_node import QualibrationNode


NodeTypeVar = TypeVar("NodeTypeVar", bound="QualibrationNode[Any, Any]")


class LocalStorageManager(StorageManager[NodeTypeVar], Generic[NodeTypeVar]):
    """
    Manages local storage of calibration nodes and their machine states.

    The `LocalStorageManager` class is responsible for saving the state of
    `QualibrationNode` instances to a local file system. It extends the
    `StorageManager` abstract base class, providing a concrete implementation
    that uses a specified root folder for data storage.

    Args:
        root_data_folder (Path): The root folder where data should be saved.
        active_machine_path (Optional[Path]): Optional path for saving the
            current active machine state.
    """

    def __init__(
        self, root_data_folder: Path, active_machine_path: Path | None = None
    ):
        self.root_data_folder = root_data_folder
        self.data_handler = DataHandler(root_data_folder=root_data_folder)
        self.active_machine_path = active_machine_path
        self.snapshot_idx = None

    def _clean_data_handler(self) -> None:
        self.data_handler.path = None
        self.data_handler.path_properties = None

    def save(self, node: NodeTypeVar) -> None:
        """
        Saves the state of the specified node to local storage.

        This method saves the results of the node to the root data folder.
        It also saves the machine state, either as a JSON file or as a folder
        with specific content mappings, depending on the structure of the
        machine. Optionally, it can also save the active machine state to a
        specified path.

        Args:
            node (QualibrationNode): The node whose state needs to be saved.

        Side Effects:
            - Saves the node's results and machine state in the root data
                folder.
            - Updates the `snapshot_idx` to reflect the newly saved node state.
            - Optionally saves the machine state to the active path if
                specified.

        Raises:
            AssertionError: If `self.data_handler.path` is not of type `Path`.
        """
        logger.info(f"Saving node {node.name} to local storage")

        # Save results
        self.data_handler.name = node.name
        self._clean_data_handler()
        outcomes = {
            k: v.value if isinstance(v, Outcome) else v
            for k, v in node.outcomes.items()
        }

        # Determine relative machine path w.r.t the data folder
        if node.machine is None:
            relative_machine_path = None
        elif (
            self.active_machine_path is None
            or self.active_machine_path.suffix == ".json"
        ):
            relative_machine_path = "./quam_state.json"
        else:
            relative_machine_path = "./quam_state"

        # Save node contents
        self.data_handler.node_data = {
            "parameters": {
                "model": node.parameters.model_dump(mode="json"),
                "schema": node.parameters.__class__.model_json_schema(),
            },
            "outcomes": outcomes,
        }
        if relative_machine_path is not None:
            self.data_handler.node_data["quam"] = relative_machine_path

        node_contents = self.data_handler.generate_node_contents(
            metadata={
                "description": node.description,
                "run_start": node.run_start.isoformat(timespec="milliseconds"),
                "run_end": (
                    datetime.now()
                    .astimezone()
                    .astimezone()
                    .isoformat(timespec="milliseconds")
                ),
            }
        )  # TODO directly access idx
        self.data_handler.save_data(
            data=node.results,
            name=node.name,
            node_contents=node_contents,
        )
        self.snapshot_idx = node_contents["id"]

        if node.machine is None:
            logger.info("Node has no QuAM, skipping node.machine.save()")
            return

        self._save_machine(
            node.machine, relative_data_path=relative_machine_path
        )

    def _save_machine(
        self,
        machine: MachineProtocol,
        relative_data_path: str | None = "./quam_state.json",
    ) -> None:
        quam = importlib.import_module("quam")
        if quam is not None:
            quam_version = getattr(quam, "__version__", "0.3.10")

            if Version(quam_version) < Version("0.4.0"):
                logger.warning(
                    "QUAM version is less than 0.4.0, using old save method. "
                    "It is recommended to upgrade QUAM to improve its saving."
                )
                self._save_old_quam(machine)
                return

        # Save machine to active path
        if self.active_machine_path is not None:
            logger.info(
                f"Saving machine to active path {self.active_machine_path}"
            )
            machine.save(self.active_machine_path)

        if (
            self.data_handler.path is None
            or isinstance(self.data_handler.path, int)
            or relative_data_path is None
        ):
            logger.warning(
                "Could not determine data saving path, skipping machine.save"
            )
            return

        # Save machine to data folder
        machine_data_path = Path(self.data_handler.path) / relative_data_path
        logger.info(f"Saving machine to data folder {machine_data_path}")
        machine.save(machine_data_path)

    def _save_old_quam(self, machine: MachineProtocol) -> None:
        if self.data_handler.path is None or isinstance(
            self.data_handler.path, int
        ):
            logger.warning(
                "Could not determine data saving path, skipping machine.save"
            )
            return

        # Define which parts of machine to save to a separate file
        proposed_content_mapping = {"wiring.json": ["wiring", "network"]}
        # Ignore content_mapping if not all required attributes are present
        all_attrs_present = all(
            hasattr(machine, elem)
            for elem_group in proposed_content_mapping.values()
            for elem in elem_group
        )
        if all_attrs_present:
            content_mapping = proposed_content_mapping
        else:
            content_mapping = None

        # Save as single file in data folder
        machine.save(Path(self.data_handler.path) / "quam_state.json")

        # Save as folder with wiring and network separated in data folder
        machine.save(
            path=Path(self.data_handler.path) / "quam_state",
            content_mapping=content_mapping,
        )

        # Optionally also save QuAM to the active path
        if self.active_machine_path is not None:
            active_path = self.active_machine_path
            logger.info(f"Saving machine to active path {active_path}")
            machine.save(
                path=self.active_machine_path,
                content_mapping=content_mapping,
            )

    def get_snapshot_idx(self, node: NodeTypeVar, update: bool = False) -> int:
        if self.snapshot_idx is not None and not update:
            return self.snapshot_idx
        self.snapshot_idx = self.data_handler.generate_node_contents()["id"]
        if self.snapshot_idx is None:
            raise RuntimeError("Snapshot idx wasn't generated")
        return self.snapshot_idx
