# Structure of storage

Check [config file description](../config.md) before this file.

Lets suppose:

- `project`: `qm`
- then user storage path: `~/.qualibrate/storage/qm`

## Expected storage structure

### Path to project data
Storage path is path to current project. So it's expected then other projects
are stored in directories next to the current project.

**Example**:

| Project name | Project path                  |
|--------------|-------------------------------|
| qm           | `~/.qualibrate/storage/qm`    |
| other        | `~/.qualibrate/storage/other` |

**Note**: The project name should always be part of the path, but does not have 
to be the last one. It's always expected that paths would have same structure. 
For example:

| Project name | Project path                       |
|--------------|------------------------------------|
| qm           | `~/.qualibrate/storage/qm/data`    |
| other        | `~/.qualibrate/storage/other/data` |

## Project content

### Structure

Each project should have next structure:
- Subfolders of project path should represent date of experiment. 
  - Format: `YYYY-MM-DD` (`YYYY` - year, `MM` - month number, `DD` - day number)
- Subfolders of date should represent node. 
  - Format: `#<node_id>_<node_name>_HHMMSS`
    - `node_id` should be unique sequential integer value (index of node)
    - `node_name` should be string contains latin alphabet symbols, numbers 
        and `-_`.
    - `HHMMSS` - time of experiment 
        (`HH` - hour (24-hour notation), `MM` - minutes, `SS` - seconds)

**Example**:
```
├── 2024-04-24
│     ├── #1_name1_120000
│     │   └── ...
│     └── #2_name2_121110
│         └── ...
├── 2024-04-25
│     ├── #3_name3_120000
│     │   └── ...
│     └── #4_name4_121314
│         └── ...
└── ...
```

### Content of node folder

Content of node folder depend on type of storage 
(`storage_type` in `config.toml`)

#### `timeline_db` type

`data.json` file contains output results of experiments. Content should be 
valid json. It's also possible to have image references (only `.png` is 
supported now) in this file. Images path should be subpath of node path.

**Example**:

Files structure:
```
#1_name1_120000
├── data.json
├── histogram.png
└── heatmap.png
```

`data.json`:

```json
{
  "key": "value",
  "images": {
    "data_histogram": "./histogram.png",
    "data_heat": "./heatmap.png"
  }
}
```

#### `local_storage` type

Files:
- `node.json` --  [required] [common node description](./node_json.md)
- `state.json` -- [optional] quam snapshot description.
- `data.json` -- [optional] [output file](#timeline_db-type).
