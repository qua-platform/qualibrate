# Qualibrate Configuration Guide

This guide describes the structure and contents of the `config.toml` file used
by Qualibrate and how to generate this configuration file.

## Configuration File: `config.toml`

The `config.toml` file contains configuration settings for Qualibrate and its
associated projects. All components of Qualibrate, including the data handler 
and QuAM DB, can be configured using this file. These configurations are
organized into sections, each defined by top-level entries (written
as `[entry-name]`).

The default location for the Qualibrate configuration file
is `~/.qualibrate/config.toml`.

### Qualibrate Top-Level Entry

The `[qualibrate]` section includes general settings for Qualibrate.

**static_site_files**

- Default: `"<package_path>/qualibrate_static"`
- Description: Path to frontend static HTML files, usually part of installation.

**storage_type**

- Default: `"local_storage"`
- Description: Type of storage.
- Allowed options:
    - `"local_storage"`: Use specified local storage as the database.
    - `"timeline_db"`: Use
      the [`json timeline database` instance](https://github.com/qua-platform/json-timeline-database)
      for data
      interactions. Output results are still stored locally.

**project**

- Description: Name of the current project.

**user_storage**

- Description: Path to the data root folder of the project.
- Note: The user storage path should include the project name. For example:
    - `project = quam_db`
    - `user_storage = ~/.qualibrate/user_storage/quam_db`
- Specific results are stored in the
  format `{user_storage}/%y%m%d/#{id}_{name}_%H%M%S`.

**metadata_out_path**

- Default: `data_path`
- Description: Field name in metadata that will be used for determining the
  output path of nodes/snapshots.

### Qualibrate Timeline Database Top-Level Entry

The `[qualibrate.timeline_db]` section configures the interface between the
Qualibrate web app and the QuAM JSON
timeline database.

**spawn**

- Default: `True`
- Description: Indicates whether to start the `json timeline database` as part
  of Qualibrate. If `True`, the database
  will be started at the `/timeline_db` subpath.

**address**

- Default: `http://localhost:8000/`
- Description: Address of the `json timeline database`. If `spawn=True`, the
  address is automatically set
  to `http://localhost:8001/timeline_db/`.

**timeout**

- Default: `1.0`
- Description: Time (in seconds) to wait for a response from
  the `json timeline database`.

### Example Configuration

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

### Configuration with References

It’s possible to use references in the configuration. The reference format
is `${#<path to item from the root>}`, where
the item path starts with `/`.

**Example with References**

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

## Generating the `config.toml` File

To generate the `config.toml` file, use the `qualibrate config` command:

```sh
qualibrate config [--config-path PATH] [--static-site-files DIRECTORY] [--storage-type 'local_storage'|'timeline_db'] [--project TEXT] [--user-storage PATH] [--metadata-out-path TEXT] [--spawn-db BOOLEAN] [--timeline-db-address TEXT] [--timeline-db-timeout FLOAT]
```

### Command Options

**--config-path**

- Default: `~/.qualibrate/config.toml`

Refer to the [Qualibrate Entry](#qualibrate-top-level-entry) section for
descriptions of the following options:

**--static-site-files**

- Corresponds to the `qualibrate.static_site_files` field.

**--storage-type**

- Corresponds to the `qualibrate.storage_type` field.

**--project**

- Corresponds to the `qualibrate.project` field.

**--user-storage**

- Corresponds to the `qualibrate.user_storage` field.

**--metadata-out-path**

- Corresponds to the `qualibrate.metadata_out_path` field.

Refer to
the [Qualibrate Timeline Database Entry](#qualibrate-timeline-database-top-level-entry)
section for
descriptions of the following options:

**--spawn-db**

- Corresponds to the `qualibrate.timeline_db.spawn` field.

**--timeline-db-address**

- Corresponds to the `qualibrate.timeline_db.address` field.

**--timeline-db-timeout**

- Corresponds to the `qualibrate.timeline_db.timeout` field.