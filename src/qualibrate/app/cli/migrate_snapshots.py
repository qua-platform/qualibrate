"""Migration script to update existing snapshots with type_of_execution field.

This script scans all node.json files in the data directory and adds:
- type_of_execution: "node" (default for all existing snapshots)

For new snapshots created with workflows, the orchestrator will set
type_of_execution to "workflow" and populate the children list.

Usage:
    python -m qualibrate.app.cli.migrate_snapshots [--dry-run] [--data-path PATH]
"""

import argparse
import json
import sys
from pathlib import Path

from qualibrate_config.models import StorageType

from qualibrate.core.models.execution_type import ExecutionType


def migrate_snapshot(node_json_path: Path, dry_run: bool = False) -> bool:
    """Migrate a single snapshot's node.json file.

    Args:
        node_json_path: Path to the node.json file.
        dry_run: If True, don't write changes, just report what would change.

    Returns:
        True if the file was (or would be) modified, False otherwise.
    """
    try:
        with node_json_path.open("r") as f:
            content = json.load(f)
    except (json.JSONDecodeError, OSError) as e:
        print(f"  ERROR: Failed to read {node_json_path}: {e}")
        return False

    modified = False

    # Ensure metadata exists
    if "metadata" not in content:
        content["metadata"] = {}
        modified = True

    # Add type_of_execution if not present
    if "type_of_execution" not in content["metadata"]:
        content["metadata"]["type_of_execution"] = ExecutionType.node.value
        modified = True

    if modified and not dry_run:
        try:
            with node_json_path.open("w") as f:
                json.dump(content, f, indent=2, default=str)
        except OSError as e:
            print(f"  ERROR: Failed to write {node_json_path}: {e}")
            return False

    return modified


def find_node_json_files(data_path: Path) -> list[Path]:
    """Find all node.json files in the data directory.

    Args:
        data_path: Root data directory.

    Returns:
        List of paths to node.json files.
    """
    return list(data_path.glob("*/*/node.json"))


def run_migration(
    data_path: Path,
    dry_run: bool = False,
    verbose: bool = False,
) -> tuple[int, int, int]:
    """Run the migration on all snapshots.

    Args:
        data_path: Root data directory.
        dry_run: If True, don't write changes.
        verbose: If True, print details for each file.

    Returns:
        Tuple of (total_files, modified_files, error_count).
    """
    node_json_files = find_node_json_files(data_path)
    total = len(node_json_files)
    modified = 0
    errors = 0

    print(f"Found {total} snapshot files to process")
    if dry_run:
        print("DRY RUN - no changes will be written")
    print()

    for i, node_json_path in enumerate(node_json_files, 1):
        if verbose:
            print(f"[{i}/{total}] Processing {node_json_path.relative_to(data_path)}")

        try:
            was_modified = migrate_snapshot(node_json_path, dry_run)
            if was_modified:
                modified += 1
                if verbose:
                    action = "Would modify" if dry_run else "Modified"
                    print(f"  {action}")
        except Exception as e:
            errors += 1
            print(f"  ERROR: {e}")

    return total, modified, errors


def main() -> int:
    """Main entry point for the migration script."""
    parser = argparse.ArgumentParser(
        description="Migrate existing snapshots to add type_of_execution field."
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Don't write changes, just report what would be modified.",
    )
    parser.add_argument(
        "--data-path",
        type=Path,
        help="Path to the data directory. If not provided, uses config.",
    )
    parser.add_argument(
        "--verbose", "-v", action="store_true", help="Print details for each file."
    )
    args = parser.parse_args()

    # Get data path from config if not provided
    data_path = args.data_path
    if data_path is None:
        try:
            from qualibrate_config.resolvers import (
                get_qualibrate_config,
                get_qualibrate_config_path,
            )

            q_config_path = get_qualibrate_config_path()
            qs = get_qualibrate_config(q_config_path)

            if qs.storage.type != StorageType.local_storage:
                print(
                    f"ERROR: Migration only supports local_storage, "
                    f"got {qs.storage.type}"
                )
                return 1

            data_path = qs.storage.location
        except Exception as e:
            print(f"ERROR: Failed to get config: {e}")
            print("Please provide --data-path explicitly.")
            return 1

    if not data_path.is_dir():
        print(f"ERROR: Data path does not exist: {data_path}")
        return 1

    print(f"Data path: {data_path}")
    print()

    total, modified, errors = run_migration(
        data_path, dry_run=args.dry_run, verbose=args.verbose
    )

    print()
    print("=" * 50)
    print(f"Total files:    {total}")
    print(f"Modified:       {modified}")
    print(f"Errors:         {errors}")
    if args.dry_run:
        print()
        print("This was a dry run. Run without --dry-run to apply changes.")

    return 0 if errors == 0 else 1


if __name__ == "__main__":
    sys.exit(main())
