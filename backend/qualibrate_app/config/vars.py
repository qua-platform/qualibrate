from pathlib import Path

CONFIG_KEY = "qualibrate_app"
QUALIBRATE_CONFIG_KEY = "qualibrate"
ACTIVE_MACHINE_CONFIG_KEY = "active_machine"
QUALIBRATE_PATH = Path().home() / ".qualibrate"
DEFAULT_CONFIG_FILENAME = "config.toml"
DEFAULT_ACTIVE_MACHINE_CONFIG_FILENAME = "active_machine.toml"
DEFAULT_QUALIBRATE_CONFIG_FILENAME = "qualibrate.toml"
DEFAULT_QUALIBRATE_APP_CONFIG_FILENAME = "qualibrate_app.toml"
CONFIG_PATH_ENV_NAME = "QUALIBRATE_APP_CONFIG_FILE"
