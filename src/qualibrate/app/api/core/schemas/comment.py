"""Request/Response schemas for comment-related endpoints."""

from pydantic import AwareDatetime, BaseModel, Field

__all__ = [
    "Comment",
    "CommentCreateRequest",
    "CommentUpdateRequest",
    "CommentRemoveRequest",
]


class Comment(BaseModel):
    """Response model for a comment."""

    id: int = Field(
        ...,
        description="Unique identifier for the comment.",
        examples=[1, 2, 3],
    )
    value: str = Field(
        ...,
        description="The comment text.",
        examples=["Some random comment", "This calibration looks good"],
    )
    created_at: AwareDatetime = Field(
        ...,
        alias="createdAt",
        description="Timestamp when the comment was created.",
    )

    model_config = {"populate_by_name": True}


class CommentCreateRequest(BaseModel):
    """Request body for creating a new comment."""

    value: str = Field(
        ...,
        min_length=1,
        description="The comment text.",
        examples=["Some random comment"],
    )


class CommentUpdateRequest(BaseModel):
    """Request body for updating an existing comment."""

    id: int = Field(
        ...,
        description="The ID of the comment to update.",
        examples=[1],
    )
    value: str = Field(
        ...,
        min_length=1,
        description="The new comment text.",
        examples=["Some random comment UPDATED"],
    )


class CommentRemoveRequest(BaseModel):
    """Request body for removing a comment."""

    id: int = Field(
        ...,
        description="The ID of the comment to remove.",
        examples=[13],
    )
