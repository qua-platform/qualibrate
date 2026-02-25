# db_registry.py


class DBRegistry:
    """
    Holds a reference to the "default" DB manager instance.
    Domain objects (like Node) can access the DB without knowing
    about the concrete manager.
    """

    _db_manager = None

    @classmethod
    def configure(cls, db_manager):
        """
        Set the DB manager instance for the application.
        Usually called once at startup.
        """
        cls._db_manager = db_manager

    @classmethod
    def get(cls):
        """
        Return the configured DB manager.
        Raises an error if no DB is configured.
        """
        if cls._db_manager is None:
            cls.configure()
            raise RuntimeError("DB not configured! Call DBRegistry.configure(db_instance) first.")
        return cls._db_manager
