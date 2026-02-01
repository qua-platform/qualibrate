"""Tests for TagRegistry class."""

import json
from pathlib import Path

import pytest
from qualibrate_config.models import QualibrateConfig
from qualibrate_config.models.qualibrate import QualibrateTopLevelConfig
from qualibrate_config.models.storage_type import StorageType

from qualibrate.app.api.core.domain.local_storage.tag_registry import (
    TAGS_FILENAME,
    TagRegistry,
)


@pytest.fixture
def storage_location(tmp_path: Path) -> Path:
    """Create a temporary storage location."""
    storage = tmp_path / "storage"
    storage.mkdir(parents=True)
    return storage


@pytest.fixture
def settings(storage_location: Path) -> QualibrateConfig:
    """Create test settings with storage location."""
    top = QualibrateTopLevelConfig(
        {
            "qualibrate": dict(
                project="test_project",
                app={
                    "static_site_files": storage_location / "static",
                    "timeline_db": dict(
                        address="http://localhost:8000/",
                        timeout=0,
                    ),
                },
                storage=dict(
                    type=StorageType.local_storage,
                    location=storage_location,
                ),
                runner=dict(
                    address="http://localhost:8001/execution/",
                    timeout=1,
                ),
            )
        }
    )
    return top.qualibrate


@pytest.fixture
def tag_registry(settings: QualibrateConfig) -> TagRegistry:
    """Create a TagRegistry instance."""
    return TagRegistry(settings=settings)


class TestTagRegistryCreate:
    """Tests for creating tags."""

    def test_create_tag_success(
        self, tag_registry: TagRegistry, storage_location: Path
    ) -> None:
        """Test creating a new tag."""
        result = tag_registry.create_tag("calibration")

        assert result is True
        # Verify tag was saved
        tags_path = storage_location / TAGS_FILENAME
        assert tags_path.exists()
        tags = json.loads(tags_path.read_text())
        assert "calibration" in tags

    def test_create_tag_already_exists(self, tag_registry: TagRegistry) -> None:
        """Test creating a tag that already exists returns True."""
        tag_registry.create_tag("calibration")
        result = tag_registry.create_tag("calibration")

        assert result is True
        # Should still only have one tag
        tags = tag_registry.list_tags()
        assert tags.count("calibration") == 1

    def test_create_tag_empty_name(self, tag_registry: TagRegistry) -> None:
        """Test creating a tag with empty name returns False."""
        result = tag_registry.create_tag("")

        assert result is False

    def test_create_tag_whitespace_only(self, tag_registry: TagRegistry) -> None:
        """Test creating a tag with whitespace-only name returns False."""
        result = tag_registry.create_tag("   ")

        assert result is False

    def test_create_tag_strips_whitespace(
        self, tag_registry: TagRegistry
    ) -> None:
        """Test that tag names are stripped of whitespace."""
        result = tag_registry.create_tag("  calibration  ")

        assert result is True
        tags = tag_registry.list_tags()
        assert "calibration" in tags
        assert "  calibration  " not in tags

    def test_create_multiple_tags(self, tag_registry: TagRegistry) -> None:
        """Test creating multiple tags."""
        tag_registry.create_tag("calibration")
        tag_registry.create_tag("rabi")
        tag_registry.create_tag("benchmarking")

        tags = tag_registry.list_tags()
        assert len(tags) == 3
        assert "calibration" in tags
        assert "rabi" in tags
        assert "benchmarking" in tags


class TestTagRegistryRemove:
    """Tests for removing tags."""

    def test_remove_tag_success(self, tag_registry: TagRegistry) -> None:
        """Test removing an existing tag."""
        tag_registry.create_tag("calibration")
        result = tag_registry.remove_tag("calibration")

        assert result is True
        tags = tag_registry.list_tags()
        assert "calibration" not in tags

    def test_remove_tag_not_exists(self, tag_registry: TagRegistry) -> None:
        """Test removing a non-existent tag returns True (idempotent)."""
        result = tag_registry.remove_tag("nonexistent")

        assert result is True

    def test_remove_tag_empty_name(self, tag_registry: TagRegistry) -> None:
        """Test removing a tag with empty name returns False."""
        result = tag_registry.remove_tag("")

        assert result is False

    def test_remove_tag_whitespace_only(self, tag_registry: TagRegistry) -> None:
        """Test removing a tag with whitespace-only name returns False."""
        result = tag_registry.remove_tag("   ")

        assert result is False

    def test_remove_tag_strips_whitespace(
        self, tag_registry: TagRegistry
    ) -> None:
        """Test that tag names are stripped when removing."""
        tag_registry.create_tag("calibration")
        result = tag_registry.remove_tag("  calibration  ")

        assert result is True
        tags = tag_registry.list_tags()
        assert "calibration" not in tags


class TestTagRegistryList:
    """Tests for listing tags."""

    def test_list_tags_empty(self, tag_registry: TagRegistry) -> None:
        """Test listing tags when none exist."""
        tags = tag_registry.list_tags()

        assert tags == []

    def test_list_tags_sorted(self, tag_registry: TagRegistry) -> None:
        """Test that listed tags are sorted."""
        tag_registry.create_tag("zebra")
        tag_registry.create_tag("alpha")
        tag_registry.create_tag("middle")

        tags = tag_registry.list_tags()
        assert tags == ["alpha", "middle", "zebra"]


class TestTagRegistryEnsureTagsExist:
    """Tests for ensure_tags_exist method."""

    def test_ensure_tags_exist_creates_missing(
        self, tag_registry: TagRegistry
    ) -> None:
        """Test that missing tags are created."""
        result = tag_registry.ensure_tags_exist(["tag1", "tag2", "tag3"])

        assert result is True
        tags = tag_registry.list_tags()
        assert "tag1" in tags
        assert "tag2" in tags
        assert "tag3" in tags

    def test_ensure_tags_exist_skips_existing(
        self, tag_registry: TagRegistry
    ) -> None:
        """Test that existing tags are not duplicated."""
        tag_registry.create_tag("existing")
        result = tag_registry.ensure_tags_exist(["existing", "new"])

        assert result is True
        tags = tag_registry.list_tags()
        assert tags.count("existing") == 1
        assert "new" in tags

    def test_ensure_tags_exist_empty_list(
        self, tag_registry: TagRegistry
    ) -> None:
        """Test with empty list returns True."""
        result = tag_registry.ensure_tags_exist([])

        assert result is True

    def test_ensure_tags_exist_filters_empty_strings(
        self, tag_registry: TagRegistry
    ) -> None:
        """Test that empty strings are filtered out."""
        result = tag_registry.ensure_tags_exist(["valid", "", "  ", "also_valid"])

        assert result is True
        tags = tag_registry.list_tags()
        assert "valid" in tags
        assert "also_valid" in tags
        assert "" not in tags

    def test_ensure_tags_exist_strips_whitespace(
        self, tag_registry: TagRegistry
    ) -> None:
        """Test that tag names are stripped."""
        result = tag_registry.ensure_tags_exist(["  spaced  "])

        assert result is True
        tags = tag_registry.list_tags()
        assert "spaced" in tags
        assert "  spaced  " not in tags

    def test_ensure_tags_exist_no_new_tags(
        self, tag_registry: TagRegistry
    ) -> None:
        """Test when all tags already exist."""
        tag_registry.create_tag("tag1")
        tag_registry.create_tag("tag2")
        result = tag_registry.ensure_tags_exist(["tag1", "tag2"])

        assert result is True


class TestTagRegistryFilePersistence:
    """Tests for file-based persistence."""

    def test_tags_persist_across_instances(
        self, settings: QualibrateConfig
    ) -> None:
        """Test that tags persist across TagRegistry instances."""
        registry1 = TagRegistry(settings=settings)
        registry1.create_tag("persistent")

        registry2 = TagRegistry(settings=settings)
        tags = registry2.list_tags()

        assert "persistent" in tags

    def test_handles_corrupted_file(
        self, settings: QualibrateConfig, storage_location: Path
    ) -> None:
        """Test handling of corrupted tags.json file."""
        tags_path = storage_location / TAGS_FILENAME
        tags_path.write_text("not valid json")

        registry = TagRegistry(settings=settings)
        tags = registry.list_tags()

        # Should return empty list on error
        assert tags == []

    def test_handles_non_list_json(
        self, settings: QualibrateConfig, storage_location: Path
    ) -> None:
        """Test handling when tags.json contains non-list JSON."""
        tags_path = storage_location / TAGS_FILENAME
        tags_path.write_text('{"not": "a list"}')

        registry = TagRegistry(settings=settings)
        tags = registry.list_tags()

        # Should return empty list
        assert tags == []

    def test_filters_non_string_tags(
        self, settings: QualibrateConfig, storage_location: Path
    ) -> None:
        """Test that non-string values in tags list are filtered."""
        tags_path = storage_location / TAGS_FILENAME
        tags_path.write_text('["valid", 123, null, "also_valid"]')

        registry = TagRegistry(settings=settings)
        tags = registry.list_tags()

        assert tags == ["also_valid", "valid"]

    def test_creates_parent_directories(
        self, tmp_path: Path
    ) -> None:
        """Test that parent directories are created if needed."""
        deep_path = tmp_path / "deep" / "nested" / "storage"
        top = QualibrateTopLevelConfig(
            {
                "qualibrate": dict(
                    project="test_project",
                    app={
                        "static_site_files": deep_path / "static",
                        "timeline_db": dict(
                            address="http://localhost:8000/",
                            timeout=0,
                        ),
                    },
                    storage=dict(
                        type=StorageType.local_storage,
                        location=deep_path,
                    ),
                    runner=dict(
                        address="http://localhost:8001/execution/",
                        timeout=1,
                    ),
                )
            }
        )
        registry = TagRegistry(settings=top.qualibrate)

        result = registry.create_tag("test")

        assert result is True
        assert (deep_path / TAGS_FILENAME).exists()
