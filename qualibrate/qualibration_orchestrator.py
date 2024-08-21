from typing import Any, Mapping

from qualibrate.utils.naming import get_full_class_path

__all__ = ["QualibrationOrchestrator"]


class QualibrationOrchestrator:
    def serialize(self) -> Mapping[str, Any]:
        return {"__class__": get_full_class_path(self.__class__)}
