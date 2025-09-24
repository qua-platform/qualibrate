from collections.abc import Mapping
from pathlib import Path
from typing import Any, Generic, Optional, cast

from qualibrate_config.resolvers import (
    get_qualibrate_config,
    get_qualibrate_config_path,
)

from qualibrate.models.run_summary.graph import GraphRunSummary
from qualibrate.models.run_summary.node import NodeRunSummary
from qualibrate.parameters import (
    ExecutionParameters,
    NodeParameters,
)
from qualibrate.qualibration_graph import NodeTypeVar, QualibrationGraph
from qualibrate.qualibration_node import QualibrationNode
from qualibrate.runnables.runnable_collection import RunnableCollection
from qualibrate.utils.logger_m import logger

__all__ = ["QualibrationLibrary"]


class QualibrationLibrary(Generic[NodeTypeVar]):
    """
    Manages a collection of Qualibration nodes and graphs for calibration
    purposes.

    This class provides functionality to load, manage, and run nodes and graphs
    from a given library folder. It supports scanning the folder to identify
    available nodes and graphs, running them with specified parameters, and
    managing an active instance of the library.

    Args:
        library_folder: The folder containing the calibration nodes and graphs.
            Defaults to None.
        set_active: Whether to set this instance as the active library.
            Defaults to True.

    Side Effects:
            Sets the `active_library` attribute if `set_active` is True.
            Calls `_scan()` if `library_folder` is provided.
    """

    active_library: Optional["QualibrationLibrary[NodeTypeVar]"] = None

    def __init__(
        self, library_folder: Path | None = None, set_active: bool = True
    ):
        self.nodes: RunnableCollection[str, NodeTypeVar] = RunnableCollection()
        self.graphs: RunnableCollection[str, QualibrationGraph[NodeTypeVar]] = (
            RunnableCollection()
        )
        self._library_folder = library_folder

        if set_active:
            self.__class__.active_library = self
        if library_folder:
            self._scan()

    def _scan(self) -> None:
        """
        Scans the library folder for nodes and graphs.

        Loads nodes and graphs from the specified `_library_folder` by scanning
        the directory for valid instances. If no folder is specified, a warning
        is logged.

        Side Effects:
            Updates the `nodes` and `graphs` dictionaries with loaded instances.
        """
        if self._library_folder is None:
            logger.warning("Can't rescan library without specified folder.")
            return
        self.nodes = cast(
            RunnableCollection[str, NodeTypeVar],
            QualibrationNode.scan_folder_for_instances(self._library_folder),
        )
        self.graphs = cast(
            RunnableCollection[str, QualibrationGraph[NodeTypeVar]],
            QualibrationGraph.scan_folder_for_instances(self._library_folder),
        )

    def rescan(self) -> None:
        """
        Rescans the library folder to refresh the nodes and graphs.

        Calls `_scan()` to reload all nodes and graphs from the specified
        library folder.
        """
        self._scan()

    @classmethod
    def get_active_library(
        cls, library_folder: Path | None = None, create: bool = True
    ) -> "QualibrationLibrary[NodeTypeVar]":
        """
        Gets or creates the active library instance.

        If an active library instance already exists, it is returned. Otherwise,
        a new library is created from the specified `library_folder`. If no
        `library_folder` is provided and the library does not exist, default
        configurations are used to create the library.

        Args:
            library_folder: Path to the folder containing the library resources.
                Defaults to None.
            create: Whether to create a new instance if none exists. Defaults
                to True.

        Returns:
            The active library instance.

        Raises:
            RuntimeError: If no library is instantiated and `create` is False,
                or if the default calibration folder cannot be resolved.
        """
        if cls.active_library is not None:
            return cls.active_library
        if not create:
            ex = RuntimeError("Library hasn't been instantiated yet.")
            logger.exception("", exc_info=ex)
            raise ex
        if library_folder is None:
            logger.warning("Getting calibration path from config")
            q_config_path = get_qualibrate_config_path()
            q_config = get_qualibrate_config(q_config_path)
            if q_config.calibration_library is None:
                raise RuntimeError("Can't resolve default calibrations config")
            library_folder = q_config.calibration_library.folder
        return QualibrationLibrary(library_folder=library_folder)

    def serialize(self) -> Mapping[str, Any]:
        """
        Serializes the library into a dictionary format.

        This method provides a JSON-serializable representation of all nodes
        and graphs, which includes their individual serialized formats. Also
        contains library folder path.

        Returns:
            A dictionary containing serialized data.
        """
        return {
            "__class__": (
                f"{self.__class__.__module__}.{self.__class__.__name__}"
            ),
            "folder": (
                str(self._library_folder)
                if self._library_folder is not None
                else None
            ),
            "nodes": [node.serialize() for node in self.nodes.values_nocopy()],
            "graphs": [
                graph.serialize() for graph in self.graphs.values_nocopy()
            ],
        }

    def get_nodes(self) -> RunnableCollection[str, NodeTypeVar]:
        """
        Returns all nodes available in the library.

        Returns:
            Dictionary of nodes keyed by their names.
        """
        return self.nodes

    def get_graphs(
        self,
    ) -> RunnableCollection[str, QualibrationGraph[NodeTypeVar]]:
        """
        Returns all graphs available in the library.

        Returns:
            Dictionary of graphs keyed by their names.
        """
        return self.graphs

    def run_node(
        self, node_name: str, input_parameters: NodeParameters
    ) -> NodeRunSummary:
        """
        Runs a specified node with the given parameters.

        This method runs the node identified by `node_name` using the provided
        `input_parameters` and returns a summary of the run.

        Args:
            node_name: The name of the node to run.
            input_parameters: The parameters to use for the run.

        Returns:
            Summary of the node run containing outcomes and details.

        Raises:
            KeyError: If the specified `node_name` does not exist in the
                library.
        """
        node = self.nodes[node_name]
        run_summary = node.run(**input_parameters.model_dump())
        return cast(NodeRunSummary, run_summary)

    def run_graph(
        self, graph_name: str, input_parameters: ExecutionParameters
    ) -> GraphRunSummary:
        """
        Runs a specified graph with the given execution parameters.

        This method runs the graph identified by `graph_name` using the provided
        `input_parameters` and returns a summary of the graph's execution.

        Args:
            graph_name: The name of the graph to run.
            input_parameters: The parameters for executing the graph.

        Returns:
            Summary of the graph execution containing outcomes and details.

        Raises:
            KeyError: If the specified `graph_name` does not exist in the
                library.
        """
        graph = self.graphs[graph_name]
        run_summary = graph.run(
            nodes=input_parameters.nodes.model_dump(),
            **input_parameters.parameters.model_dump(),
        )
        return cast(GraphRunSummary, run_summary)
