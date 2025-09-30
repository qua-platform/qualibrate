from abc import ABC, abstractmethod
from collections.abc import Mapping, Sequence
from typing import Any, Generic

from pydantic import create_model

from qualibrate.models.execution_history import (
    ExecutionHistory,
    ExecutionHistoryItem,
)
from qualibrate.models.outcome import Outcome
from qualibrate.parameters import RunnableParameters
from qualibrate.qualibration_graph import NodeTypeVar, QualibrationGraph
from qualibrate.utils.logger_m import logger
from qualibrate.utils.naming import get_full_class_path

__all__ = ["QualibrationOrchestrator"]


class QualibrationOrchestrator(ABC, Generic[NodeTypeVar]):
    """
    Abstract base class for orchestrating the execution of nodes in a
    calibration graph.

    This class manages execution flow, runtime tracking, and node traversal
    within a calibration graph. It also provides methods to stop the execution,
    clean up resources, and serialize the orchestrator's current state.

    Args:
        **parameters: Keyword arguments for initializing the orchestrator
            parameters.
    """

    def __init__(self, **parameters: Any):
        self._graph: QualibrationGraph[NodeTypeVar] | None = None
        self._is_stopped: bool = False
        self.parameters_class = create_model(
            "OrchestratorParameters",
            __base__=RunnableParameters,
            **{  # type: ignore
                name: (type(value), value) for name, value in parameters.items()
            },
        )
        self._parameters = self.parameters_class()
        self.initial_targets: list[Any] | None = None
        self.targets: list[Any] | None = None
        self._execution_history: list[ExecutionHistoryItem] = []
        self._active_node: NodeTypeVar | None = None
        self.final_outcomes: dict[Any, Outcome] = {}

    @property
    def active_node(self) -> NodeTypeVar | None:
        """
        Gets the currently active node.

        Returns:
            Optional[QualibrationNode]: The node that is currently active, or
            None if no node is active.
        """
        return self._active_node

    @property
    def active_node_name(self) -> str | None:
        """
        Gets the name of the currently active node.

        Returns:
            Optional[str]: The name of the active node, or None if no node
            is active.
        """
        return self.active_node.name if self.active_node else None

    def stop(self) -> None:
        """
        Stops the execution of the orchestrator.

        Sets `_is_stopped` to True to indicate that execution should be halted.
        """
        logger.debug("Orchestrator. Stop")
        self._is_stopped = True

    def cleanup(self) -> None:
        """
        Cleans up the orchestrator state.

        Resets the internal graph, targets, execution history, active node,
        and final outcomes.
        """
        logger.debug("Orchestrator. Cleanup")
        self._graph = None
        self._is_stopped = False
        self.initial_targets = None
        self.targets = None
        self._execution_history = []
        self._active_node = None
        self.final_outcomes = {}

    def serialize(self) -> Mapping[str, Any]:
        """
        Serializes the orchestrator's current state into a dictionary
        representation.

        Returns:
            Mapping[str, Any]: A dictionary containing the class path and
            serialized parameters.
        """
        return {
            "__class__": get_full_class_path(self.__class__),
            "parameters": self.parameters_class.serialize(),
        }

    def get_execution_history(self) -> ExecutionHistory:
        """
        Gets the execution history of the orchestrator.

        Returns:
            ExecutionHistory: An object containing the execution history items.
        """
        return ExecutionHistory(items=self._execution_history)

    @abstractmethod
    def traverse_graph(
        self, graph: QualibrationGraph[NodeTypeVar], targets: Sequence[Any]
    ) -> None:
        """
        Abstract method for traversing a graph.

        This method should be implemented by subclasses to define the execution
        flow for the provided graph and targets.

        Args:
            graph (QualibrationGraph): The calibration graph to be traversed.
            targets (Sequence[Any]): The list of target nodes to start
            execution from.
        """
        pass
