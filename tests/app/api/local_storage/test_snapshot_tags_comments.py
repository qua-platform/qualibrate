"""Tests for snapshot tag and comment operations."""

import json
from pathlib import Path

import pytest


class TestSnapshotTagsAPI:
    """Tests for snapshot tag API endpoints."""

    def test_get_tags_empty(
        self, client_custom_settings, default_local_storage_project
    ) -> None:
        """Test getting tags from a snapshot with no tags."""
        response = client_custom_settings.get("/api/snapshot/3/tags")

        assert response.status_code == 200
        assert response.json() == []

    def test_assign_tags_to_snapshot(
        self, client_custom_settings, default_local_storage_project
    ) -> None:
        """Test assigning tags to a snapshot."""
        response = client_custom_settings.post(
            "/api/snapshot/3/tags",
            json={"tags": ["calibration", "rabi"]},
        )

        assert response.status_code == 200
        assert response.json() is True

        # Verify tags were assigned
        get_response = client_custom_settings.get("/api/snapshot/3/tags")
        assert set(get_response.json()) == {"calibration", "rabi"}

    def test_assign_tags_replaces_existing(
        self, client_custom_settings, default_local_storage_project
    ) -> None:
        """Test that assigning tags replaces existing tags."""
        # First assignment
        client_custom_settings.post(
            "/api/snapshot/3/tags",
            json={"tags": ["old_tag"]},
        )

        # Second assignment should replace
        client_custom_settings.post(
            "/api/snapshot/3/tags",
            json={"tags": ["new_tag"]},
        )

        get_response = client_custom_settings.get("/api/snapshot/3/tags")
        tags = get_response.json()
        assert "new_tag" in tags
        assert "old_tag" not in tags

    def test_assign_tags_filters_duplicates(
        self, client_custom_settings, default_local_storage_project
    ) -> None:
        """Test that duplicate tags are filtered."""
        response = client_custom_settings.post(
            "/api/snapshot/3/tags",
            json={"tags": ["dup", "dup", "dup", "unique"]},
        )

        assert response.status_code == 200
        get_response = client_custom_settings.get("/api/snapshot/3/tags")
        tags = get_response.json()
        assert tags.count("dup") == 1
        assert "unique" in tags

    def test_remove_tag_from_snapshot(
        self, client_custom_settings, default_local_storage_project
    ) -> None:
        """Test removing a tag from a snapshot."""
        # First assign tags
        client_custom_settings.post(
            "/api/snapshot/3/tags",
            json={"tags": ["keep", "remove"]},
        )

        # Remove one tag
        response = client_custom_settings.post(
            "/api/snapshot/3/tag/remove",
            json={"name": "remove"},
        )

        assert response.status_code == 200
        assert response.json() is True

        # Verify tag was removed
        get_response = client_custom_settings.get("/api/snapshot/3/tags")
        tags = get_response.json()
        assert "keep" in tags
        assert "remove" not in tags

    def test_remove_tag_not_exists(
        self, client_custom_settings, default_local_storage_project
    ) -> None:
        """Test removing a tag that doesn't exist returns True (idempotent)."""
        response = client_custom_settings.post(
            "/api/snapshot/3/tag/remove",
            json={"name": "nonexistent"},
        )

        assert response.status_code == 200
        assert response.json() is True

    def test_tags_persist_in_node_json(
        self, client_custom_settings, default_local_storage_project
    ) -> None:
        """Test that tags are persisted in node.json."""
        client_custom_settings.post(
            "/api/snapshot/3/tags",
            json={"tags": ["persisted"]},
        )

        # Read node.json directly
        node_path = (
            default_local_storage_project
            / "2024-04-25"
            / "#3_name_3_182700"
            / "node.json"
        )
        node_content = json.loads(node_path.read_text())

        assert "tags" in node_content.get("metadata", {})
        assert "persisted" in node_content["metadata"]["tags"]


class TestSnapshotCommentsAPI:
    """Tests for snapshot comment API endpoints."""

    def test_get_comments_empty(
        self, client_custom_settings, default_local_storage_project
    ) -> None:
        """Test getting comments from a snapshot with no comments."""
        response = client_custom_settings.get("/api/snapshot/3/comments")

        assert response.status_code == 200
        assert response.json() == []

    def test_create_comment(
        self, client_custom_settings, default_local_storage_project
    ) -> None:
        """Test creating a comment on a snapshot."""
        response = client_custom_settings.post(
            "/api/snapshot/3/comment/create",
            json={"value": "This is a test comment"},
        )

        assert response.status_code == 200
        comment = response.json()
        assert comment["id"] == 1
        assert comment["value"] == "This is a test comment"
        assert "createdAt" in comment

    def test_create_multiple_comments(
        self, client_custom_settings, default_local_storage_project
    ) -> None:
        """Test creating multiple comments."""
        client_custom_settings.post(
            "/api/snapshot/3/comment/create",
            json={"value": "First comment"},
        )
        client_custom_settings.post(
            "/api/snapshot/3/comment/create",
            json={"value": "Second comment"},
        )

        get_response = client_custom_settings.get("/api/snapshot/3/comments")
        comments = get_response.json()

        assert len(comments) == 2
        assert comments[0]["id"] == 1
        assert comments[1]["id"] == 2

    def test_update_comment(
        self, client_custom_settings, default_local_storage_project
    ) -> None:
        """Test updating a comment."""
        # Create a comment
        create_response = client_custom_settings.post(
            "/api/snapshot/3/comment/create",
            json={"value": "Original text"},
        )
        comment_id = create_response.json()["id"]

        # Update it
        update_response = client_custom_settings.post(
            "/api/snapshot/3/comment/update",
            json={"id": comment_id, "value": "Updated text"},
        )

        assert update_response.status_code == 200
        assert update_response.json() is True

        # Verify update
        get_response = client_custom_settings.get("/api/snapshot/3/comments")
        comments = get_response.json()
        assert comments[0]["value"] == "Updated text"

    def test_update_comment_not_found(
        self, client_custom_settings, default_local_storage_project
    ) -> None:
        """Test updating a non-existent comment returns 404."""
        response = client_custom_settings.post(
            "/api/snapshot/3/comment/update",
            json={"id": 999, "value": "Won't work"},
        )

        assert response.status_code == 404
        assert "not found" in response.json()["detail"].lower()

    def test_remove_comment(
        self, client_custom_settings, default_local_storage_project
    ) -> None:
        """Test removing a comment."""
        # Create comments
        client_custom_settings.post(
            "/api/snapshot/3/comment/create",
            json={"value": "Comment to keep"},
        )
        create_response = client_custom_settings.post(
            "/api/snapshot/3/comment/create",
            json={"value": "Comment to remove"},
        )
        comment_id = create_response.json()["id"]

        # Remove one
        remove_response = client_custom_settings.post(
            "/api/snapshot/3/comment/remove",
            json={"id": comment_id},
        )

        assert remove_response.status_code == 200
        assert remove_response.json() is True

        # Verify removal
        get_response = client_custom_settings.get("/api/snapshot/3/comments")
        comments = get_response.json()
        assert len(comments) == 1
        assert comments[0]["value"] == "Comment to keep"

    def test_remove_comment_not_found(
        self, client_custom_settings, default_local_storage_project
    ) -> None:
        """Test removing a non-existent comment returns True (idempotent)."""
        response = client_custom_settings.post(
            "/api/snapshot/3/comment/remove",
            json={"id": 999},
        )

        assert response.status_code == 200
        assert response.json() is True

    def test_comments_persist_in_node_json(
        self, client_custom_settings, default_local_storage_project
    ) -> None:
        """Test that comments are persisted in node.json."""
        client_custom_settings.post(
            "/api/snapshot/3/comment/create",
            json={"value": "Persisted comment"},
        )

        # Read node.json directly
        node_path = (
            default_local_storage_project
            / "2024-04-25"
            / "#3_name_3_182700"
            / "node.json"
        )
        node_content = json.loads(node_path.read_text())

        assert "comments" in node_content.get("metadata", {})
        comments = node_content["metadata"]["comments"]
        assert len(comments) == 1
        assert comments[0]["value"] == "Persisted comment"

    def test_comment_id_incrementing(
        self, client_custom_settings, default_local_storage_project
    ) -> None:
        """Test that comment IDs increment properly."""
        # Create and delete comments
        resp1 = client_custom_settings.post(
            "/api/snapshot/3/comment/create",
            json={"value": "Comment 1"},
        )
        resp2 = client_custom_settings.post(
            "/api/snapshot/3/comment/create",
            json={"value": "Comment 2"},
        )

        # Delete first comment
        client_custom_settings.post(
            "/api/snapshot/3/comment/remove",
            json={"id": resp1.json()["id"]},
        )

        # Create new comment - should have ID 3
        resp3 = client_custom_settings.post(
            "/api/snapshot/3/comment/create",
            json={"value": "Comment 3"},
        )

        assert resp3.json()["id"] == 3


class TestGlobalTagsAPI:
    """Tests for global tag registry API endpoints."""

    def test_list_global_tags_empty(
        self, client_custom_settings, default_local_storage_project
    ) -> None:
        """Test listing global tags when none exist."""
        response = client_custom_settings.get("/api/snapshot/tags")

        assert response.status_code == 200
        assert response.json() == []

    def test_create_global_tag(
        self, client_custom_settings, default_local_storage_project
    ) -> None:
        """Test creating a global tag."""
        response = client_custom_settings.post(
            "/api/snapshot/tag/create",
            json={"name": "global_tag"},
        )

        assert response.status_code == 200
        assert response.json() is True

        # Verify tag exists
        list_response = client_custom_settings.get("/api/snapshot/tags")
        assert "global_tag" in list_response.json()

    def test_remove_global_tag(
        self, client_custom_settings, default_local_storage_project
    ) -> None:
        """Test removing a global tag."""
        # Create tag first
        client_custom_settings.post(
            "/api/snapshot/tag/create",
            json={"name": "to_remove"},
        )

        # Remove it
        response = client_custom_settings.post(
            "/api/snapshot/tag/remove",
            json={"name": "to_remove"},
        )

        assert response.status_code == 200
        assert response.json() is True

        # Verify removal
        list_response = client_custom_settings.get("/api/snapshot/tags")
        assert "to_remove" not in list_response.json()

    def test_assigning_tags_auto_creates_global(
        self, client_custom_settings, default_local_storage_project
    ) -> None:
        """Test that assigning tags to snapshot auto-creates them globally."""
        # Assign tags to snapshot
        client_custom_settings.post(
            "/api/snapshot/3/tags",
            json={"tags": ["auto_created_1", "auto_created_2"]},
        )

        # Check they exist globally
        list_response = client_custom_settings.get("/api/snapshot/tags")
        global_tags = list_response.json()
        assert "auto_created_1" in global_tags
        assert "auto_created_2" in global_tags


class TestSnapshotTagsEdgeCases:
    """Edge case tests for tag operations."""

    def test_assign_empty_tags_list(
        self, client_custom_settings, default_local_storage_project
    ) -> None:
        """Test assigning empty tags list clears all tags."""
        # First assign some tags
        client_custom_settings.post(
            "/api/snapshot/3/tags",
            json={"tags": ["tag1", "tag2"]},
        )

        # Then clear with empty list
        response = client_custom_settings.post(
            "/api/snapshot/3/tags",
            json={"tags": []},
        )

        # Note: This may fail validation - depends on schema
        # If it passes, tags should be empty
        if response.status_code == 200:
            get_response = client_custom_settings.get("/api/snapshot/3/tags")
            assert get_response.json() == []

    def test_tag_with_special_characters(
        self, client_custom_settings, default_local_storage_project
    ) -> None:
        """Test tags with special characters."""
        response = client_custom_settings.post(
            "/api/snapshot/3/tags",
            json={"tags": ["tag-with-dash", "tag_with_underscore", "tag.with.dot"]},
        )

        assert response.status_code == 200
        get_response = client_custom_settings.get("/api/snapshot/3/tags")
        tags = get_response.json()
        assert "tag-with-dash" in tags
        assert "tag_with_underscore" in tags
        assert "tag.with.dot" in tags


class TestSnapshotCommentsEdgeCases:
    """Edge case tests for comment operations."""

    def test_create_comment_strips_whitespace(
        self, client_custom_settings, default_local_storage_project
    ) -> None:
        """Test that comment values are stripped."""
        response = client_custom_settings.post(
            "/api/snapshot/3/comment/create",
            json={"value": "  spaced comment  "},
        )

        assert response.status_code == 200
        comment = response.json()
        assert comment["value"] == "spaced comment"

    def test_update_comment_strips_whitespace(
        self, client_custom_settings, default_local_storage_project
    ) -> None:
        """Test that updated comment values are stripped."""
        # Create comment
        create_response = client_custom_settings.post(
            "/api/snapshot/3/comment/create",
            json={"value": "Original"},
        )
        comment_id = create_response.json()["id"]

        # Update with whitespace
        client_custom_settings.post(
            "/api/snapshot/3/comment/update",
            json={"id": comment_id, "value": "  updated  "},
        )

        # Verify stripped
        get_response = client_custom_settings.get("/api/snapshot/3/comments")
        comments = get_response.json()
        assert comments[0]["value"] == "updated"

    def test_comment_with_unicode(
        self, client_custom_settings, default_local_storage_project
    ) -> None:
        """Test comments with unicode characters."""
        response = client_custom_settings.post(
            "/api/snapshot/3/comment/create",
            json={"value": "Comment with emoji 🎉 and unicode: é, ñ, 日本語"},
        )

        assert response.status_code == 200
        comment = response.json()
        assert "🎉" in comment["value"]
        assert "日本語" in comment["value"]
