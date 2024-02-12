from datetime import datetime

from pydantic import BaseModel
from qualibrate_api_base.api_bases import DocumentType


class SnapshotFile(BaseModel):
    id: str
    created_at: datetime
    modified_at: datetime


class SnapshotFileWithData(SnapshotFile):
    data: DocumentType
