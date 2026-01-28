"""Request/Response schemas for tag-related endpoints."""

from pydantic import BaseModel, Field

__all__ = [
    "TagNameRequest",
    "TagsAssignRequest",
]


class TagNameRequest(BaseModel):
    """Request body for tag create/remove operations."""

    name: str = Field(
        ...,
        min_length=1,
        description="The tag name.",
        examples=["calibration", "rabi", "benchmarking"],
    )


class TagsAssignRequest(BaseModel):
    """Request body for assigning multiple tags to a snapshot."""

    tags: list[str] = Field(
        ...,
        min_length=1,
        description="List of tag names to assign.",
        examples=[["calibration", "rabi"], ["quick-check"]],
    )
