from contextlib import contextmanager
from typing import Any, Mapping, Type, Optional

from qualibrate import NodeParameters
from qualibrate.storage import StorageManager


class QualibrationNode:
    mode: str = "default"
    storage_manager: Optional[StorageManager] = None

    def __init__(self, name, parameters_class: Type[NodeParameters], description=None):
        self.name = name
        self.parameters_class = parameters_class
        self.description = description

        self.parameters: Optional[NodeParameters] = None
        self._state_updates = {}
        self.results = {}

        if self.mode == "inspection":
            from qualibrate_app.qualibration_library import (
                LibraryScanException,
                QualibrationLibrary,
            )

            if QualibrationLibrary.active_library is None:
                raise LibraryScanException(
                    "Scanning library, but no active library set"
                )

            QualibrationLibrary.active_library.add_node(self)
            raise LibraryScanException(
                "Scanning library, aborting further script execution"
            )

    def serialize(self) -> Mapping[str, Any]:
        return {
            "name": self.name,
            "input_parameters": self.parameters_class.serialize(),
            "description": self.description,
        }

    def save(self):
        self.storage_manager.save(node=self)

    def run_node(self, input_parameters):
        QualibrationNode.mode == "external"
        self.run_node_file(self.node_filepath)

    def _record_state_update(self, attr, val):
        self._state_updates[attr] = val

    @contextmanager
    def record_state_updates(self):
        if self.mode == "interactive":
            # Override QuamComponent.__setattr__()
            try:
                from quam.core import QuamBase

                setattr_func = QuamBase.__setattr__
                QuamBase.__setattr__ = self._record_state_update()
                yield
            finally:
                QuamBase.__setattr__ = setattr_func
        else:
            yield
