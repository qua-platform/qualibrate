from pathlib import Path
from typing import Any, Mapping, Optional

from pydantic import BaseModel


class Storage(BaseModel):
    path: Optional[Path] = None
    data: Optional[Mapping[str, Any]] = None
