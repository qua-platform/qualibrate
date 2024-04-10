from typing import Optional

from qualibrate.api.core.models.base import ModelWithId
from qualibrate.api.core.models.snapshot import SimplifiedSnapshotWithMetadata
from qualibrate.api.core.models.storage import Storage


class Node(ModelWithId):
    snapshot: SimplifiedSnapshotWithMetadata
    storage: Optional[Storage]
