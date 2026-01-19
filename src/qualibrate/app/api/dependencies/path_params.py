from typing import Annotated

from fastapi import Path


def get_snapshot_filename(snapshot: Annotated[str, Path()]) -> str:
    return snapshot
