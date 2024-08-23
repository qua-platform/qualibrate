from abc import ABC, abstractmethod
from typing import Any, Dict, List, Mapping, Optional, Sequence

from pydantic import create_model

from qualibrate.outcome import Outcome
from qualibrate.qualibration_graph import QualibrationGraph
from qualibrate.utils.naming import get_full_class_path

__all__ = ["QualibrationOrchestrator"]


class QualibrationOrchestrator(ABC):
    def __init__(
        self,
        **parameters: Any,
    ):
        self._graph: Optional[QualibrationGraph] = None
        self.parameters_class = create_model(
            "OrchestratorParameters",
            **{  # type: ignore
                name: (type(value), value) for name, value in parameters.items()
            },
        )
        self._parameters = self.parameters_class()
        self.initial_targets: Optional[List[Any]] = None
        self.targets: Optional[List[Any]] = None
        self._execution_history: Sequence[Any] = []
        self.final_outcomes: Dict[Any, Outcome] = {}

    def serialize(self) -> Mapping[str, Any]:
        return {"__class__": get_full_class_path(self.__class__)}

    def get_execution_history(self) -> Sequence[Any]:
        return self._execution_history

    @abstractmethod
    def traverse_graph(
        self, graph: QualibrationGraph, targets: Sequence[Any]
    ) -> None:
        pass
