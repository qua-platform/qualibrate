import string
from typing import Mapping, Any, Sequence

AllowedSearchKeys = string.ascii_letters + string.digits + "-_*"

IdType = int
DocumentType = Mapping[str, Any]
DocumentSequenceType = Sequence[DocumentType]
