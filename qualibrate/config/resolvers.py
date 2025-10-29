import warnings
from pathlib import Path

from qualibrate_config.models import QualibrateConfig


def get_quam_state_path(config: QualibrateConfig) -> Path | None:
    root = config.__class__._root
    if root is None:
        return None
    raw_config = root._raw_dict
    state_path = raw_config.get("quam", {}).get("state_path")
    if state_path is not None:
        return Path(state_path)
    am_path = raw_config.get("active_machine", {}).get("path")
    if am_path is None:
        return None
    warnings.warn(
        (
            'The config entry "active_machine.path" has been deprecated in '
            'favor of "quam.state_path". Please update the qualibrate config '
            "(~/.qualibrate/config.toml) accordingly."
        ),
        DeprecationWarning,
        stacklevel=2,
    )
    return Path(am_path)
