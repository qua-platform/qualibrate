import string
from collections.abc import Mapping, Sequence
from typing import Any

AllowedSearchKeys = string.ascii_letters + string.digits + "-_*"

IdType = int
DocumentType = Mapping[str, Any]
DocumentSequenceType = Sequence[DocumentType]
