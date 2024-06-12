import string
from typing import Any, Mapping, Sequence

AllowedSearchKeys = string.ascii_letters + string.digits + "-_*"

IdType = int
DocumentType = Mapping[str, Any]
DocumentSequenceType = Sequence[DocumentType]
