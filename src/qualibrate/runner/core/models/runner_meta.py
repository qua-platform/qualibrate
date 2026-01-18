from functools import cached_property
from importlib.metadata import version as package_version

from pydantic import BaseModel, computed_field


class RunnerMeta(BaseModel):
    @computed_field  # type: ignore[prop-decorator]
    @cached_property
    def version(self) -> str:
        return package_version("qualibrate_runner")
