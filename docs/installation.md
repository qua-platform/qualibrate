# Installation Guide

This guide will provide a detailed walkthrough for installing QUAlibrate, a user-programmed calibration software for large-scale quantum computers. This guide will help you set up QUAlibrate, configure it properly, and verify your installation to ensure everything is working smoothly.

## :one: Pre-requisites

/// tab | For Windows
- Windows 10 (build 1809 and later), or Windows 11
- 3.9 ≤ Python ≤ 3.11, we recommend Python 3.10 or 3.11

/// details | Using a virtual environment in Windows
    type: tip

It is recommended to install QuAM in a Python virtual environment.

If using Anaconda, this can be done via

```bash
conda create -n {environment_name}  
conda activate {environment_name}
```

Be sure to replace `{environment_name}` with a name of your choosing

To create a virtual environment without Anaconda, open PowerShell :octicons-terminal-16:, navigate to
a folder where you would like to create a virtual environment, and execute the 
following command:

```
python -m venv {environment_name}  
source {environment_name}\Scripts\Activate.ps1
```
///
///

/// tab | For MacOS
- Tested on MacOS Ventura and MacOS Sonoma
- 3.9 ≤ Python ≤ 3.11, we recommend Python 3.10 or 3.11

/// details | Using a virtual environment in MacOS
    type: tip

It is recommended to install QuAM in a Python virtual environment.  
To create a virtual environment, open terminal :octicons-terminal-16:, navigate to a folder where you would like to create a virtual environment, and execute the following command:
```
python -m venv {environment_name}
source {environment_name}/bin/activate
```
///
///

/// tab | For Linux
- QuAM has not been tested on Linux. However, it should follow similar instructions as MacOS.
///


## :two: Install QUAlibrate

To install QUAlibrate, simply run the following command:

```bash
pip install qualibrate
```

This command will fetch the latest stable version of QUAlibrate from PyPI and install it on your machine.

This step will also install the following essential QUAlibrate components:

- **qualibrate-core**: Contains all the features needed to create and run calibration nodes and graphs.
- **qualibrate-app**: Provides a [Web App](web_app.md) from which calibrations can be run through a graphical user interface (GUI).
- **qualibrate-runner**: A local server that can execute calibration jobs from the [QUAlibrate Web App](web_app.md).

## :three: Run the Configuration Setup

After installing QUAlibrate, you need to create a configuration file. The configuration file contains important settings, such as default paths and connection details, that can be edited later if needed.

Run the following command to start the config generation:

```bash
qualibrate config
```

This will propose a default configuration file located at `~/.qualibrate/config.toml`. You can hit `Y` to accept the default options.

Typically the following two settings need to be configured:

- `qualibrate.storage.location` specifies the data storage folder
- `qualibrate_runner.calibration_library_folder`  specifies the folder containing the calibration nodes and graphs.

These settings can either be modified by directly editing the configuration file (`~/.qualibrate/config.toml`) or through the command line:

```bash
qualibrate config --app-user-storage DATA_LOCATION --runner-calibration-library-folder LIBRARY_FOLDER
```

where `DATA_LOCATION` and `LIBRARY_FOLDER` need to be modified accordingly.   

## :four: Verify Installation

To verify that QUAlibrate is installed correctly, you can start the QUAlibrate web interface:

```bash
qualibrate start
```

- If everything is set up properly, the web interface will be accessible at http\://localhost:8001.
- Once started, navigate to this URL in your web browser to confirm that QUAlibrate is running and ready to use.
- The list of calibrations should be empty as the calibration nodes or graphs still need to be defined.

## Troubleshooting Common Issues

1. **Pip Not Found**: If you encounter an error saying `pip: command not found`, ensure that Python and pip are installed and correctly added to your system's PATH.

2. **Permission Errors**: If you receive a permission error during installation, try using `pip install qualibrate --user` to install QUAlibrate for your user account only.

3. **Configuration Problems**: If there are issues during the configuration setup, manually inspect the configuration file at `~/.qualibrate/config.toml` to ensure all values are correct.

## Updating QUAlibrate

To update QUAlibrate to the latest version, you can use the following command:

```bash
pip install --upgrade qualibrate
```

This ensures you always have the latest features and bug fixes.

## Next Steps

TODO write me
