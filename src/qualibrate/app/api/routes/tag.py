"""API routes for global tag management."""

from typing import Annotated

from fastapi import APIRouter, Body, Depends, status
from qualibrate_config.models import QualibrateConfig

from qualibrate.app.api.core.domain.local_storage.tag_registry import TagRegistry
from qualibrate.app.api.core.schemas.tag import TagNameRequest
from qualibrate.app.config import get_settings

__all__ = ["tag_router"]

tag_router = APIRouter(prefix="/snapshot", tags=["tags"])


def _get_tag_registry(
    settings: Annotated[QualibrateConfig, Depends(get_settings)],
) -> TagRegistry:
    """Get the tag registry instance for the current project."""
    return TagRegistry(settings=settings)


@tag_router.post(
    "/tag/create",
    summary="Create a new global tag",
    response_model=bool,
    responses={
        status.HTTP_200_OK: {
            "description": "Tag creation result",
            "content": {
                "application/json": {
                    "examples": {
                        "success": {
                            "summary": "Tag created successfully",
                            "value": True,
                        },
                        "failure": {
                            "summary": "Tag creation failed",
                            "value": False,
                        },
                    }
                }
            },
        }
    },
)
def create_tag(
    request: Annotated[TagNameRequest, Body()],
    tag_registry: Annotated[TagRegistry, Depends(_get_tag_registry)],
) -> bool:
    """
    Create a new global tag in the tag registry.

    If the tag already exists, returns True without creating a duplicate.
    Tags are stored in a project-scoped `tags.json` file.

    ### Example

    **Request:**
    ```json
    {"name": "calibration"}
    ```

    **Response:** `true` or `false`
    """
    return tag_registry.create_tag(request.name)


@tag_router.get(
    "/tags",
    summary="List all global tags",
    response_model=list[str],
    responses={
        status.HTTP_200_OK: {
            "description": "List of all registered tags",
            "content": {
                "application/json": {
                    "examples": {
                        "with_tags": {
                            "summary": "Tags exist",
                            "value": ["benchmarking", "calibration", "rabi"],
                        },
                        "empty": {
                            "summary": "No tags",
                            "value": [],
                        },
                    }
                }
            },
        }
    },
)
def list_tags(
    tag_registry: Annotated[TagRegistry, Depends(_get_tag_registry)],
) -> list[str]:
    """
    Get all registered global tags.

    Returns a sorted list of all tag names in the project's tag registry.

    ### Example

    **Response:**
    ```json
    ["benchmarking", "calibration", "quick-check", "rabi"]
    ```
    """
    return tag_registry.list_tags()


@tag_router.post(
    "/tag/remove",
    summary="Remove a global tag",
    response_model=bool,
    responses={
        status.HTTP_200_OK: {
            "description": "Tag removal result",
            "content": {
                "application/json": {
                    "examples": {
                        "success": {
                            "summary": "Tag removed successfully",
                            "value": True,
                        },
                        "failure": {
                            "summary": "Tag removal failed",
                            "value": False,
                        },
                    }
                }
            },
        }
    },
)
def remove_tag(
    request: Annotated[TagNameRequest, Body()],
    tag_registry: Annotated[TagRegistry, Depends(_get_tag_registry)],
) -> bool:
    """
    Remove a global tag from the tag registry.

    **Note:** This only removes the tag from the global registry.
    Existing snapshots that have this tag assigned will retain it
    (soft delete behavior).

    If the tag doesn't exist, returns True.

    ### Example

    **Request:**
    ```json
    {"name": "calibration"}
    ```

    **Response:** `true` or `false`
    """
    return tag_registry.remove_tag(request.name)
