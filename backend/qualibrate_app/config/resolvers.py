import os
from functools import lru_cache
from pathlib import Path
from typing import Annotated, cast

from fastapi import Depends

from qualibrate_app.config.file import get_config_file
from qualibrate_app.config.models import (
    ActiveMachineSettings,
    QualibrateAppSettings,
    QualibrateSettings,
)
from qualibrate_app.config.validation import (
    get_config_model_or_print_error,
    get_config_solved_references_or_print_error,
)
from qualibrate_app.config.vars import (
    ACTIVE_MACHINE_CONFIG_KEY,
    CONFIG_KEY,
    CONFIG_PATH_ENV_NAME,
    QUALIBRATE_CONFIG_KEY,
)


@lru_cache
def get_config_path() -> Path:
    return get_config_file(os.environ.get(CONFIG_PATH_ENV_NAME))


@lru_cache
def get_settings(
    config_path: Annotated[Path, Depends(get_config_path)],
) -> QualibrateAppSettings:
    config = get_config_solved_references_or_print_error(config_path)
    if config is None:
        raise RuntimeError("Couldn't read config file")
    qs = get_config_model_or_print_error(
        config.get(QUALIBRATE_CONFIG_KEY, {}),
        QualibrateSettings,
        QUALIBRATE_CONFIG_KEY,
    )
    ams = get_config_model_or_print_error(
        config.get(ACTIVE_MACHINE_CONFIG_KEY, {}),
        ActiveMachineSettings,
        ACTIVE_MACHINE_CONFIG_KEY,
    )
    qas_config = config.get(CONFIG_KEY, {})
    qas_config.update(
        {QUALIBRATE_CONFIG_KEY: qs, ACTIVE_MACHINE_CONFIG_KEY: ams}
    )
    qas = get_config_model_or_print_error(
        qas_config, QualibrateAppSettings, CONFIG_KEY
    )
    if qas is None:
        raise RuntimeError("Couldn't read config file")
    return cast(QualibrateAppSettings, qas)
