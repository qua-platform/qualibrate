from functools import wraps

from qualibrate.core.utils.logger_m import logger


def handle_missing_project(default=None):
    """
    Decorator for repository methods to catch RuntimeError
    from missing project keys in PostgresManagement sessions.
    """

    def decorator(func):
        @wraps(func)
        def wrapper(self, *args, **kwargs):
            try:
                return func(self, *args, **kwargs)
            except RuntimeError as e:
                logger.warning(f"{func.__name__} failed: {e}")
                return default

        return wrapper

    return decorator
