from typing import Optional

from pydantic import BaseModel

from qualibrate.utils.logger_m import logger

try:
    from qualibrate_app.config import (
        QualibrateAppSettings,
        get_config_path,
        get_settings,
    )
except ModuleNotFoundError:
    get_config_path = get_settings = None
    QualibrateAppSettings = BaseModel


def get_qualibrate_app_settings(
    raise_ex: bool = False,
) -> Optional[QualibrateAppSettings]:
    if get_settings is None or get_config_path is None:
        msg = "Can't import qualibrate_app"
        if raise_ex:
            raise ModuleNotFoundError(msg)
        logger.warning(msg)
        return None

    config_path = get_config_path()
    return get_settings(config_path)
