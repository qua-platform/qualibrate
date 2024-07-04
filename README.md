# Qualibrate

## Installation

### 1. Install package

**1a Install from wheel or .tar.gz file**

> pip install <path_to_file>/qualibrate-0.1.0-py3-none-any.whl

**1b Install from folder**

1. Navigate to top-level folder `qualibrate`
2. Run `pip install .`

### 2. Create config

Run the following command

> qualibrate config

Press Y to confirm the creation of the configuration file.

This will generate a default configuration file in `~/.qualibrate/config.toml`.  
`--help` option can be added for getting list of possible args.

### 3. Modify necessary settings
The default configuration needs to be adjusted to the specific environment.
Open the configuration file in `~/.qualibrate/config.toml` and adjust the following settings:

- `qualibrate_runner.calibration_library_folder` - Path to the folder where calibration files are stored
- `qualiibrate_app.user_storage` - Path to the folder where all calibration data is stored
- `qualibrate_app.project` - Name of the project. This should be a top-level folder of `user_storage`.

### 3. Run the QUAlibrate server

> qualibrate start

After running the command, the server will start and the user can access the application at `http://localhost:8001/`