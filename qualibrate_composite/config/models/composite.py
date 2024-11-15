from typing import ClassVar, Optional

from pydantic_settings import SettingsConfigDict
from qualibrate_config.models.base.base_referenced_settings import (
    BaseReferencedSettings,
)

from qualibrate_composite.config.models.remote_services import (
    QualibrateApp,
    QualibrateRunner,
)
from qualibrate_composite.config.vars import (
    Q_COMPOSITE_SETTINGS_ENV_PREFIX,
)

__all__ = ["QualibrateSettings"]


class QualibrateSettings(BaseReferencedSettings):
    model_config: ClassVar[SettingsConfigDict] = SettingsConfigDict(
        extra="ignore",
        env_prefix=Q_COMPOSITE_SETTINGS_ENV_PREFIX,
    )
    password: Optional[str] = None

    app: QualibrateApp
    runner: QualibrateRunner
