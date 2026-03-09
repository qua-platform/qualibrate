"""Setup script to create database tables.

Run this to initialize your production database schema.
"""

from typing import Any

from sqlalchemy import create_engine, text

# Production database configuration
PROD_CONFIG = {
    "host": "localhost",
    "port": 5432,
    "database": "qualibrate",
    "username": "postgres",
    "password": "postgres",
}


def create_machine_state_table(config: dict[str, Any]) -> None:
    """Create the machine_state table in the specified database."""
    connection_url = (
        f"postgresql://{config['username']}:{config['password']}@{config['host']}:{config['port']}/{config['database']}"
    )

    engine = create_engine(connection_url)

    with engine.connect() as conn:
        # Create machine_state table
        conn.execute(
            text("""
            CREATE TABLE IF NOT EXISTS machine_state (
                id SERIAL PRIMARY KEY,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                content JSONB
            )
        """)
        )
        conn.commit()
        print(f"✓ Created machine_state table in '{config['database']}' database")

    engine.dispose()


def main() -> None:
    """Setup production database."""
    print("Setting up production database...")
    create_machine_state_table(PROD_CONFIG)
    print("✓ Database setup complete!")


if __name__ == "__main__":
    main()
