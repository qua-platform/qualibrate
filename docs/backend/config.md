# Qualibrate config
This file describes content of `config.toml` 
file and how to generate it.

## `config.toml` file

This file contains config of `qualibrate` (and other projects).
All components of QUAlibrate (including data handler, QuAM DB, etc.) can be 
configured from a configuration file. These configurations can be combined 
into a single configuration file, separated by top-level entries 
(written as [entry-name]).

The default location for the QUAlibrate configuration file is in 
`~/.qualibrate/config.toml`.

### Allowed entries
#### Qualibrate entry

Top level entry: `[qualibrate]`

- `static_site_files` (default: `<package_path>/qualibrate_static`): Path to frontend static html files
- `storage_type` (default: `local_storage`): Type of storage. 
  - Allowed options:
    - `local_storage` - Local storage. Use specified local storage as database. 
    - `timeline_db` - Use 
        [`json timeline database` instance](https://github.com/qua-platform/json-timeline-database) 
        for interacting with data. Output results still stores locally. 
- `project`: name of current project
- `user_storage`: Path to data root folder of project.
  - Note that user storage should contain `project`. Example 
    - `project = quam_db`
    - `user_storage = ~/.qualibrate/user_storage/quam_db` 
  - Specific results are stored in the format 
      `{user_storage}/%y%m%d/#{id}_{name}_%H%M%S`
- `metadata_out_path` (default: `data_path`): name of field in metadata that 
    will be used for solving output path of node/snapshot

#### Qualibrate timeline database entry

Top level entry: `[qualibrate.timeline_db]`
This configuration section describes the interface between the QUAlibrate web 
app and the QuAM JSON timeline database.

- `spawn` (default: `True`): Specifies is it needed to start `json timeline database`
    as part of QUAlibrate. If `True` `json timeline database` will be started 
    at `/timeline_db` subpath.
- `address` (default: `http://localhost:8000/`): 
    Address of `json timeline database`. If `spawn=True` `address` value will 
    be automatically set to `http://localhost:8001/timeline_db/`.  
- `timeout` (default: `1.0`): Time (in seconds) for waiting response 
    from `json timeline database` by QUAlibrate.

### Example

```toml
[qualibrate]
static_site_files = "/Users/serwan/Repositories/qualibrate/backend/qualibrate_static"
storage_type = "local_storage"
project = "new_db"
user_storage = "/Users/serwan/temp/data/new_db"
metadata_out_path = "data_path"

[qualibrate.timeline_db]
spawn = true
address = "http://localhost:8001/json_db/"
timeout = 1.0
```

### Config with references
It’s possible to use references in config.

Reference format: `${#<path to item from the root>}`; 
item path should start with `/`.

**Example**

```toml
[qualibrate]
static_site_files = "/Users/serwan/Repositories/qualibrate/backend/qualibrate_static"
storage_type = "local_storage"
project = "new_db"
user_storage = "/Users/serwan/temp/data/${#/qualibrate/project}"
metadata_out_path = "data_path"

[qualibrate.timeline_db]
spawn = true
address = "http://localhost:8001/json_db/"
timeout = 1.0
```

## `qualibrate config` command

Command for generating `config.toml`

> qualibrate config [--config-path PATH] [--static-site-files DIRECTORY] 
> [--storage-type 'local_storage'|'timeline_db'] [--project TEXT] 
> [--user-storage PATH] [--metadata-out-path TEXT] [--spawn-db BOOLEAN] 
> [--timeline-db-address TEXT] [--timeline-db-timeout FLOAT]

- `--config-path` (default: `~/.qualibrate/config.toml`): Path to config file.

For next config args description check 
  [Qualibrate entry section](#qualibrate-entry)
- `--static-site-files`: `static_site_files` field
- `--storage-type`: `storage_type` field
- `--project`: `project` field
- `--user-storage`: `user_storage` field
- `--metadata-out-path`: `metadata_out_path` field

For next config args description check 
[Qualibrate timeline database entry section](#qualibrate-timeline-database-entry)
- `--spawn-db`: `spawn` field
- `--timeline-db-address`: `address` field
- `--timeline-db-timeout`: `timeout` field