"""Root conftest.py - ensures src directory is in Python path for tests."""

import sys
from pathlib import Path

import pytest

# Add src directory to Python path so tests can import qualibrate modules
# without requiring the package to be installed
src_path = Path(__file__).parent.parent / "src"
if str(src_path) not in sys.path:
    sys.path.insert(0, str(src_path))


# ==============================================================================
# SHARED POSTGRESQL TEST CONFIGURATION
# ==============================================================================
# Change these credentials to match your local PostgreSQL setup
# IMPORTANT: Uses a separate test database to avoid affecting production data
POSTGRES_TEST_CONFIG = {
    "host": "localhost",
    "port": 5432,
    "database": "qualibrate_test",  # Separate test database
    "username": "postgres",
    "password": "postgres",
}


def get_postgres_test_config() -> dict:
    """Get PostgreSQL test configuration.

    Returns a dict with connection parameters that can be used to create
    DBConfig objects or connection URLs.
    """
    return POSTGRES_TEST_CONFIG.copy()


def is_postgres_available() -> bool:
    """Check if PostgreSQL is available for testing.

    Attempts to connect to a local PostgreSQL instance.
    Returns True if connection succeeds, False otherwise.
    """
    try:
        from sqlalchemy import create_engine, text

        # Use shared test configuration
        config = get_postgres_test_config()
        connection_url = (
            f"postgresql://{config['username']}:{config['password']}"
            f"@{config['host']}:{config['port']}/{config['database']}"
        )
        engine = create_engine(connection_url, pool_pre_ping=True)
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        engine.dispose()
        return True
    except Exception:
        return False


# Define postgres marker for tests that require PostgreSQL
def pytest_configure(config):
    """Register custom markers."""
    config.addinivalue_line(
        "markers",
        "postgres: mark test as requiring PostgreSQL database (skipped if not available)",
    )


def pytest_collection_modifyitems(config, items):
    """Skip postgres tests if PostgreSQL is not available."""
    if is_postgres_available():
        # PostgreSQL is available, don't skip anything
        return

    skip_postgres = pytest.mark.skip(reason="PostgreSQL not available")
    for item in items:
        if "postgres" in item.keywords:
            item.add_marker(skip_postgres)
