from collections.abc import Sequence
from typing import Annotated

from fastapi import Query

from qualibrate_app.api.core.types import AllowedSearchKeys
from qualibrate_app.api.core.utils.request_utils import HTTPException422


def check_path_item(item: str) -> bool:
    return len(item) > 0 and all(c in AllowedSearchKeys for c in item)


def check_path(value: str) -> str:
    """
    Check that all symbols in path in ascii + digits + `_-`

    Raises:
        `InvalidMongoPath` if path is invalid.

    Returns:
        Passed path
    """
    if not all(check_path_item(subpath) for subpath in value.split(".")):
        raise HTTPException422(detail=f"Invalid mongo search path '{value}'")
    return value


def get_search_path(
    data_path: Annotated[str, Query(description="Path to search")],
) -> Sequence[str | int]:
    """Generate list of search subpaths from search path.

    Raises:
        `InvalidMongoPath` if path is invalid.

    Returns:
        List of item subpaths
    """
    return [
        int(item) if item.isnumeric() else item
        for item in check_path(data_path).split(".")
    ]
