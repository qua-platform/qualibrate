"""Setup script to create test database.

Run this once to create the qualibrate_test database for integration tests.
"""

from sqlalchemy import create_engine, text

# Connect to postgres database to create new database
ADMIN_CONFIG = {
    "host": "localhost",
    "port": 5432,
    "database": "postgres",  # Connect to postgres db to create new db
    "username": "postgres",
    "password": "postgres",
}


def create_test_database():
    """Create qualibrate_test database if it doesn't exist."""
    connection_url = (
        f"postgresql://{ADMIN_CONFIG['username']}:{ADMIN_CONFIG['password']}"
        f"@{ADMIN_CONFIG['host']}:{ADMIN_CONFIG['port']}/{ADMIN_CONFIG['database']}"
    )

    engine = create_engine(connection_url, isolation_level="AUTOCOMMIT")

    with engine.connect() as conn:
        # Check if database exists
        result = conn.execute(
            text("SELECT 1 FROM pg_database WHERE datname = 'qualibrate_test'")
        )
        exists = result.fetchone() is not None

        if exists:
            print("✓ qualibrate_test database already exists")
        else:
            # Create database
            conn.execute(text("CREATE DATABASE qualibrate_test"))
            print("✓ Created qualibrate_test database")

    engine.dispose()


def main():
    """Setup test database."""
    print("Setting up test database...")
    create_test_database()
    print("✓ Test database setup complete!")
    print("\nNote: Integration tests will create/drop tables automatically.")
    print("Your production 'qualibrate' database will not be affected.")


if __name__ == "__main__":
    main()