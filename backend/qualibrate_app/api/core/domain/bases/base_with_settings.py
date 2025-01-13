from abc import ABC

from qualibrate_config.models import (
    JsonTimelineDBRemoteServiceConfig,
    QualibrateAppConfig,
    QualibrateConfig,
)


class DomainWithConfigBase(ABC):  # noqa: B024
    def __init__(self, settings: QualibrateConfig):
        self._settings = settings

    @property
    def app_config(self) -> QualibrateAppConfig:
        if self._settings.app is None:
            raise RuntimeError("Qualibrate app config not set")
        return self._settings.app

    @property
    def timeline_db_config(self) -> JsonTimelineDBRemoteServiceConfig:
        app = self.app_config
        if app.timeline_db is None:
            raise RuntimeError("Timeline DB of Qualibrate app config not set")
        return app.timeline_db
