from enum import IntFlag


class LoadTypeFlag(IntFlag):
    def _is_set(self, field: "LoadTypeFlag") -> bool:
        return (self & field) == field
