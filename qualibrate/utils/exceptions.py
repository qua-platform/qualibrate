from typing import TYPE_CHECKING, Any

if TYPE_CHECKING:
    from qualibrate.q_runnnable import (
        CreateParametersType,
        QRunnable,
        RunParametersType,
    )


class StopInspection(Exception):
    def __init__(
        self,
        *args: Any,
        instance: "QRunnable[CreateParametersType, RunParametersType]",
    ):
        super().__init__(*args, instance)
        self.instance = instance


class TargetsFieldNotExist(AttributeError):
    pass
