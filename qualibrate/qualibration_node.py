from contextlib import contextmanager

from qualibrate.storage import StorageManager
from qualibrate import NodeParameters


class QualibrationNode:
    mode: str = "default"
    storage_manager: StorageManager = None

    def __init__(self, name, parameters: NodeParameters, description=None):
        self.name = name
        self.parameters = parameters
        self.description = description
        self._state_updates = {}

        if self.mode == "library_scan":
            QualibrationLibrary.add_node(self)
            raise RuntimeError("Scanning library, aborting further script execution")

    def save(self): ...


    def _record_state_update(self, attr, val):
        self._state_updates[attr] = val

    @contextmanager
    def record_state_updates(self):
        if self.mode == "interactive":
            # Override QuamComponent.__setattr__()
            try:
                from quam.core import QuamBase

                setattr_func = QuamBase.__setattr__
                QuamBase.__setattr__ = self._record_setattr()
                yield
            finally:
                QuamBase.__setattr__ = setattr_func
        else:
            yield
