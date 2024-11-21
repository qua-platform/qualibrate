from typing import Any, ClassVar


class Singleton(type):
    _instances: ClassVar[dict[type, type]] = {}

    def __call__(cls, *args: Any, **kwargs: Any) -> type:
        if cls not in cls._instances:
            cls._instances[cls] = super().__call__(*args, **kwargs)
        return cls._instances[cls]

    @classmethod
    def _clear(cls) -> None:
        cls._instances = {}
