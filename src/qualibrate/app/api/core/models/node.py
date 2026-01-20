from qualibrate.app.api.core.models.base import ModelWithId
from qualibrate.app.api.core.models.snapshot import (
    SimplifiedSnapshotWithMetadata,
)
from qualibrate.app.api.core.models.storage import Storage


class Node(ModelWithId):
    snapshot: SimplifiedSnapshotWithMetadata
    storage: Storage | None
