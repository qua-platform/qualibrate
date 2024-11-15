import warnings
from copy import deepcopy
from typing import (
    Any,
)

from qualibrate_config.vars import (
    ACTIVE_MACHINE_CONFIG_KEY,
    QUALIBRATE_CONFIG_KEY,
)

from qualibrate_app.config.vars import (
    CONFIG_KEY,
)


def check_config_pre_v1_and_update(
    common_config: dict[str, Any], qapp_config: dict[str, Any]
) -> tuple[dict[str, Any], dict[str, Any], dict[str, Any]]:
    if "config_version" in qapp_config:
        return (
            common_config[QUALIBRATE_CONFIG_KEY],
            common_config[ACTIVE_MACHINE_CONFIG_KEY],
            qapp_config,
        )
    warnings.warn(
        UserWarning(
            "You are using old version of config. "
            "Please update to new structure."
        ),
        stacklevel=2,
    )
    qapp_config = dict(deepcopy(qapp_config))
    qualibrate_config = {
        "storage": {
            "type": qapp_config.pop("storage_type"),
            "location": qapp_config.pop("user_storage").replace(
                f"#/{CONFIG_KEY}/project",
                f"#/{QUALIBRATE_CONFIG_KEY}/project",
            ),
        },
        "project": qapp_config.pop("project"),
    }
    active_machine_config = {}
    if "active_machine_path" in qapp_config:
        active_machine_config["path"] = qapp_config.pop("active_machine_path")
    return qualibrate_config, active_machine_config, qapp_config
