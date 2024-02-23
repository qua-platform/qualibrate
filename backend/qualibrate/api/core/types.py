import string
from typing import Union, Mapping, Any, Sequence

AllowedSearchKeys = string.ascii_letters + string.digits + "-_*"

IdType = Union[str, int]
DocumentType = Mapping[str, Any]
DocumentSequenceType = Sequence[DocumentType]
