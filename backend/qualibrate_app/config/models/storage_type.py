from enum import Enum

__all__ = ["StorageType"]


class StorageType(Enum):
    local_storage = "local_storage"
    timeline_db = "timeline_db"
