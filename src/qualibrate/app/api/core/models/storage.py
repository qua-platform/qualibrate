from collections.abc import Mapping
from pathlib import Path
from typing import Any

from pydantic import BaseModel


class Storage(BaseModel):
    path: Path | None = None
    data: Mapping[str, Any] | None = None
