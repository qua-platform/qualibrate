# QUAlibrate app

This doc describes how to install, setup and start QUAlibrate web app.

##  Storage types

Check storage_types on the [config page](./docs/backend/config.md#qualibrate-entry) 

How to choose: **TODO**

## Installation

### Pre-requirements

- Python >= 3.9

### Qualibrate

#### Local storage

> pip install ./qualibrate_backend-0.1.0-py3-none-any.whl

#### Timeline database

If you want to start timeline db separately you can use **previous**
command. If you want to start timeline db as part of qualibrate you 
need to **install with extra**:

> python3 -m pip install "./qualibrate_backend-0.1.0-py3-none-any.whl[json-timeline-db]"


## [Configuration](./docs/backend/config.md)

## [Start](./docs/backend/start.md)
