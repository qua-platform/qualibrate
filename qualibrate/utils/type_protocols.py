from pathlib import Path
from typing import Any, Protocol

TargetType = str


class GetRefProtocol(Protocol):
    def get_reference(self, attr: str | None) -> str: ...


class GetRefGetItemProtocol(GetRefProtocol, Protocol):
    def __getitem__(self, attr: str | None) -> Any:
        pass


class MachineProtocol(Protocol):
    """
    Protocol defining the interface for a machine object.
    """

    def save(self, path: Path | None = None, **kwargs: Any) -> None:
        """
        Saves the machine state to the specified path.
        """
        ...

    def generate_config(self, **kwargs: Any) -> dict[str, Any]:
        """
        Generates the configuration dictionary for the machine.
        """
        ...

    def to_dict(
        self, include_defaults: bool = ..., *args: Any, **kwargs: Any
    ) -> dict[str, Any]: ...

    def get_root(self) -> "MachineProtocol": ...
