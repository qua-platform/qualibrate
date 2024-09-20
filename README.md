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

This will generate a default configuration file
in `~/.qualibrate/config.toml`.  
`--help` option can be added for getting list of possible args.

### 3. Modify necessary settings

The default configuration needs to be adjusted to the specific environment.
Open the configuration file in `~/.qualibrate/config.toml` and adjust the
following settings:

- `qualibrate_runner.calibration_library_folder` - Path to the folder where
  calibration files are stored
- `qualibrate_app.qualibrate.storage.location` - Path to the folder where all
  calibration data is stored
- `qualibrate_app.qualibrate.project` - Name of the project. This should be
  a top-level folder of `user_storage`.

### 3. Run the QUAlibrate server

> qualibrate start

After running the command, the server will start and the user can access the
application at `http://localhost:8001/`

## Config

Available config cli command options

#### `--config-path`

Path to the configuration file.
If the path points to a file, it will be read and the old configuration will be
reused, except for the variables specified by the user. If the file does not
exist, a new one will be created.
If the path points to a directory, a check will be made to see if files with the
default name exist.
The default file names are:

1. `qualibrate.toml` - a project-specific configuration file
2. `config.toml` - a general qualibrate configuration file
   If a project-specific configuration file exists, it will be used.

If a project-specific configuration file does not exist, a general configuration
file will be checked. If both files are not found in the directory, a
general configuration file will be created in the directory.

**Default**: `~/.qualibrate/config.toml`

#### `--auto-accept`

Flag responsible for whether to skip confirmation of the generated config.

If the flag is specified in the invoked command, the configuration will be
written to the file without confirmation by the user.
If the flag is not used, the user will be shown the generated config based
on: 1) the old config file, if it existed; 2) default values; 3) values entered
by the user. Confirmation will also be requested whether the file was generated
correctly.

#### `--qualibrate-password`

Password used to authorize users.

By default, no password is used. Everyone has access to the API.
If a password is specified during configuration, you must log in to access the
API.

**Default**: `None`

#### `--spawn-runner`

This flag indicates whether the `qualibrate-runner` service should be started.
This service is designed to run nodes and graphs. The service can be spawned
independently.

**Default**: True

#### `--runner-address`

Address of `qualibrate-runner` service. If the service is spawned by the
`qualibrate` then the default address should be kept as is. If you are running
the service separately, you must specify its address.

**Default**: http://localhost:8001/execution

#### `--runner-timeout`

Maximum waiting time for a response from the `qualibrate-runner` service.

**Default**: 1.0

#### `--runner-calibration-library-resolver`

String contains python path to the class that represents qualibration library.

**Default**: "qualibrate.QualibrationLibrary"

#### `--runner-calibration-library-folder`

Path to the folder contains calibration nodes and graphs.

**Default**: `~/.qualibrate/calibrations`

#### `--spawn-app`

This flag indicates whether the `qualibrate-app` service should be started.
This service is designed to getting info about snapshots. The service can be
spawned independently.

**Default**: True

#### `--app-static-site-files`

Path to the frontend build static files.

**Default**: `<env_libs_path>/qualibrate_static`

#### `--app-storage-type`

Type of storage. Only `local_storage` is supported now. Use specified local
path as the database.

**Default**: "local_storage"

#### `--app-user-storage`

Path to the local user storage. Used for storing nodes output data.
`${...}` - config reference.

**Default**: `~/.qualibrate/user_storage/${#/qualibrate/project}`

#### `--app-project`

The name of qualibrate app project that will be used for storing runs results
and resolving them.

**Default**: "init_project"

#### `--app-metadata-out-path`

Key of metadata that's used for resolving path where a node results should be 
stored to or resolved from.

**Default**: "data_path"

The path to the directory where the active machine state should be stored. 

#### `--active-machine-path`

**Default**: None

#### `--log-folder`

The path to the directory where the logs should be stored to.

**Default**: QUALIBRATE_PATH / "logs"
