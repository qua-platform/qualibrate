from typing import ClassVar, Optional

from pydantic_settings import BaseSettings, SettingsConfigDict

from qualibrate_composite.config.models.remote_services import (
    QualibrateApp,
    QualibrateRunner,
)

__all__ = ["QualibrateSettings"]


class QualibrateSettings(BaseSettings):
    model_config: ClassVar[SettingsConfigDict] = SettingsConfigDict(
        extra="ignore",
    )
    password: Optional[str] = None

    app: QualibrateApp
    runner: QualibrateRunner
