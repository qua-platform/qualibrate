import os
from functools import lru_cache
from pathlib import Path
from typing import Annotated

from fastapi import Depends
from qualibrate_config.file import get_config_file
from qualibrate_config.resolvers import (
    get_active_machine_config_path,
    get_active_machine_settings,
    get_config_dict,
    get_config_model,
    get_qualibrate_config_path,
    get_qualibrate_settings,
)
from qualibrate_config.storage import STORAGE
from qualibrate_config.vars import (
    ACTIVE_MACHINE_CONFIG_KEY,
    QUALIBRATE_CONFIG_KEY,
)

from qualibrate_app.config.models import (
    QualibrateAppSettings,
)
from qualibrate_app.config.vars import (
    CONFIG_KEY,
    CONFIG_PATH_ENV_NAME,
    DEFAULT_QUALIBRATE_APP_CONFIG_FILENAME,
)


@lru_cache
def get_config_path() -> Path:
    return get_config_file(
        os.environ.get(CONFIG_PATH_ENV_NAME),
        DEFAULT_QUALIBRATE_APP_CONFIG_FILENAME,
        raise_not_exists=False,
    )


@lru_cache
def get_settings(
    am_config_path: Annotated[Path, Depends(get_active_machine_config_path)],
    app_config_path: Annotated[Path, Depends(get_config_path)],
    q_config_path: Annotated[Path, Depends(get_qualibrate_config_path)],
) -> QualibrateAppSettings:
    ams = get_active_machine_settings(am_config_path, STORAGE)
    qs = get_qualibrate_settings(q_config_path, STORAGE)
    qas_config = get_config_dict(
        app_config_path,
        CONFIG_KEY,
        STORAGE,
    )
    qas_config.update(
        {QUALIBRATE_CONFIG_KEY: qs, ACTIVE_MACHINE_CONFIG_KEY: ams}
    )
    return get_config_model(
        app_config_path,
        CONFIG_KEY,
        QualibrateAppSettings,
        {CONFIG_KEY: qas_config},
    )
