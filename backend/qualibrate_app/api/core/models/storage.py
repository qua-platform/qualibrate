from collections.abc import Mapping
from pathlib import Path
from typing import Any, Optional

from pydantic import BaseModel


class Storage(BaseModel):
    path: Optional[Path] = None
    data: Optional[Mapping[str, Any]] = None
