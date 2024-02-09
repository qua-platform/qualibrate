import os
from pathlib import Path

from qualibrate_api_base.api_bases import DocumentsSequence


def resolve_and_check_relative(base_path: Path, subpath: os.PathLike[str]) -> Path:
    """
    Build full path from base path and subpath. Raise error if build path isn't
    subpath of base path.

    Raises:
        ValueError: Built path isn't subpath of base path.
    """
    full = (base_path / Path(subpath)).resolve()
    if not full.is_relative_to(base_path):
        raise ValueError("Subpath isn't relative to base.")
    return full
