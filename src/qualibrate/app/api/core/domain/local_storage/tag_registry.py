"""Tag registry for managing global tags in local storage."""

import json
import logging
from pathlib import Path

from qualibrate_config.models import QualibrateConfig

__all__ = ["TagRegistry"]

logger = logging.getLogger(__name__)

TAGS_FILENAME = "tags.json"


class TagRegistry:
    """
    Manages a global tag registry for the project.

    Tags are stored in a `tags.json` file in the project's storage location.
    This registry tracks all available tags that can be assigned to snapshots.

    Args:
        settings: The application settings for Qualibrate.
    """

    def __init__(self, settings: QualibrateConfig):
        self._settings = settings
        self._tags_path = self._get_tags_path()

    def _get_tags_path(self) -> Path:
        """Get the path to the tags.json file."""
        return self._settings.storage.location / TAGS_FILENAME

    def _load_tags(self) -> list[str]:
        """Load tags from the tags.json file.

        Returns:
            List of tag names, or empty list if file doesn't exist.
        """
        if not self._tags_path.is_file():
            return []
        try:
            with self._tags_path.open("r") as f:
                tags = json.load(f)
                if isinstance(tags, list):
                    return [t for t in tags if isinstance(t, str)]
                return []
        except (json.JSONDecodeError, OSError) as ex:
            logger.exception(f"Failed to load tags from {self._tags_path}", exc_info=ex)
            return []

    def _save_tags(self, tags: list[str]) -> bool:
        """Save tags to the tags.json file.

        Args:
            tags: List of tag names to save.

        Returns:
            True if save succeeded, False otherwise.
        """
        try:
            # Ensure parent directory exists
            self._tags_path.parent.mkdir(parents=True, exist_ok=True)
            with self._tags_path.open("w") as f:
                json.dump(sorted(set(tags)), f, indent=2)
            return True
        except OSError as ex:
            logger.exception(f"Failed to save tags to {self._tags_path}", exc_info=ex)
            return False

    def list_tags(self) -> list[str]:
        """Get all registered tags.

        Returns:
            Sorted list of all tag names.
        """
        logger.debug("Listing all registered tags")
        return sorted(self._load_tags())

    def create_tag(self, name: str) -> bool:
        """Create a new tag.

        Args:
            name: The tag name to create.

        Returns:
            True if tag was created (or already exists), False on error.
        """
        logger.debug(f"Creating global tag: {name}")
        if not name or not name.strip():
            logger.warning("Cannot create tag with empty name")
            return False

        name = name.strip()
        tags = self._load_tags()

        if name in tags:
            # Tag already exists, considered success
            logger.debug(f"Tag '{name}' already exists in registry")
            return True

        tags.append(name)
        if self._save_tags(tags):
            logger.info(f"Created global tag: {name}")
            return True
        return False

    def remove_tag(self, name: str) -> bool:
        """Remove a tag from the registry.

        Note: This only removes the tag from the global registry.
        Existing snapshots that have this tag assigned will retain it.

        Args:
            name: The tag name to remove.

        Returns:
            True if tag was removed (or didn't exist), False on error.
        """
        logger.debug(f"Removing global tag: {name}")
        if not name or not name.strip():
            logger.warning("Cannot remove tag with empty name")
            return False

        name = name.strip()
        tags = self._load_tags()

        if name not in tags:
            # Tag doesn't exist, considered success
            logger.debug(f"Tag '{name}' not found in registry")
            return True

        tags.remove(name)
        if self._save_tags(tags):
            logger.info(f"Removed global tag: {name}")
            return True
        return False

    def ensure_tags_exist(self, tag_names: list[str]) -> bool:
        """Ensure all given tags exist in the registry, creating any missing ones.

        This method checks the provided tag names and adds any that don't already
        exist in the global registry. It's typically called when assigning tags
        to a snapshot to auto-create missing tags.

        Args:
            tag_names: List of tag names to ensure exist.

        Returns:
            True if all tags exist (or were created), False on error.
        """
        logger.debug(f"Ensuring tags exist in registry: {tag_names}")
        if not tag_names:
            return True

        tags = self._load_tags()
        original_count = len(tags)
        new_tags = []

        for name in tag_names:
            if name and name.strip() and name.strip() not in tags:
                tags.append(name.strip())
                new_tags.append(name.strip())

        if len(tags) == original_count:
            # No new tags to add
            logger.debug("All tags already exist in registry")
            return True

        if self._save_tags(tags):
            logger.info(f"Auto-created missing tags in registry: {new_tags}")
            return True
        return False
