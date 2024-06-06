# QUAlibrate app

This doc describes how to install, setup and start QUAlibrate web app.

## Installation

### Pre-requirements

- Python >= 3.9

### Install QUAlibrate package

> pip install ./qualibrate_backend-0.1.0-py3-none-any.whl

Wheel package can be downloaded
on [releases page](https://github.com/qua-platform/qualibrate/releases)

## [Configuration](./docs/backend/config.md)

QUAlibrate should be configured for first-time usage. At a minimum, a directory to a data folder should be defined:

> qualibrate config --user-storage C:/path/to/root/data/folder

This creates the configuration folder `~/.qualibrate`

For details see [Configuration documentation](./docs/backend/config.md)

## [Start](./docs/backend/start.md)

Once QUAlibrate has been configured, it can be started using:

> qualibrate start

This should start up the QUAlibrate server, and will indicate the web path, the default being `localhost:8001`.
