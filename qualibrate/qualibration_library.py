from importlib.util import find_spec
from pathlib import Path
from typing import Any, Dict, Mapping, Optional, cast

from qualibrate.models.run_summary.graph import GraphRunSummary
from qualibrate.models.run_summary.node import NodeRunSummary
from qualibrate.parameters import (
    ExecutionParameters,
    NodeParameters,
)
from qualibrate.qualibration_graph import QualibrationGraph
from qualibrate.qualibration_node import QualibrationNode
from qualibrate.utils.logger_m import logger

__all__ = ["QualibrationLibrary"]


class QualibrationLibrary:
    active_library: Optional["QualibrationLibrary"] = None

    def __init__(
        self, library_folder: Optional[Path] = None, set_active: bool = True
    ):
        self.nodes: Dict[str, QualibrationNode] = {}
        self.graphs: Dict[str, QualibrationGraph] = {}
        self._library_folder = library_folder

        if set_active:
            self.__class__.active_library = self
        if library_folder:
            self._scan()

    def _scan(self) -> None:
        if self._library_folder is None:
            logger.warning("Can't rescan library without specified folder.")
            return
        self.nodes = cast(
            Dict[str, QualibrationNode],
            QualibrationNode.scan_folder_for_instances(self._library_folder),
        )
        self.graphs = cast(
            Dict[str, QualibrationGraph],
            QualibrationGraph.scan_folder_for_instances(self._library_folder),
        )

    def rescan(self) -> None:
        self._scan()

    @classmethod
    def get_active_library(
        cls, library_folder: Optional[Path] = None, create: bool = True
    ) -> "QualibrationLibrary":
        if cls.active_library is not None:
            return cls.active_library
        if not create:
            ex = RuntimeError("Library hasn't been instantiated yet.")
            logger.exception("", exc_info=ex)
            raise ex
        if library_folder is None:
            logger.warning("Getting calibration path from config")
            if find_spec("qualibrate_runner") is not None:
                from qualibrate_runner.config import (
                    get_config_path,
                    get_settings,
                )

                config_path = get_config_path()
                settings = get_settings(config_path)
                library_folder = settings.calibration_library_folder
            if library_folder is None:
                raise RuntimeError("Can't resolve default calibrations folder")
        return QualibrationLibrary(library_folder=library_folder)

    def serialize(self) -> Mapping[str, Any]:
        return {"nodes": [node.serialize() for node in self.nodes.values()]}

    def get_nodes(self) -> Mapping[str, QualibrationNode]:
        return self.nodes

    def get_graphs(self) -> Mapping[str, QualibrationGraph]:
        return self.graphs

    def run_node(
        self, node_name: str, input_parameters: NodeParameters
    ) -> NodeRunSummary:
        node = self.nodes[node_name]
        return cast(NodeRunSummary, node.run(**input_parameters.model_dump()))

    def run_graph(
        self, graph_name: str, input_parameters: ExecutionParameters
    ) -> GraphRunSummary:
        graph = self.graphs[graph_name]
        return cast(
            GraphRunSummary,
            graph.run(
                nodes=input_parameters.nodes.model_dump(),
                **input_parameters.parameters.model_dump(),
            ),
        )
