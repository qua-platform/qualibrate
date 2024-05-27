# Structure of storage

Check [config file description](../config.md) before this file.

In this example we will assume that:

- `qualibrate.project`: `qm`
- `qualibrate.user_storage`: `~/data/${#/qualibrate/project}`

Note that in this example the project `qm` is a folder within the root directory `~/data`.

## Expected storage structure

### Path to project data
The storage path is chosen with respect to the current project. 
As a consequence, other projects are stored in directories next to the current project.

**Example**:

| Project name | Project path                  |
|--------------|-------------------------------|
| qm           | `~/data/qm`    |
| other        | `~/data/other` |

**Note**: The project name should always be part of the path, but does not have 
to be the last one. It's always expected that paths would have same structure. This structure can be specified in the configuration file:

`user_storage = ~/storage/${#/project}/data`

| Project name | Project path                       |
|--------------|------------------------------------|
| qm           | `~/storage/qm/data`    |
| other        | `~/storage/other/data` |

## Project content

### Structure

Each project should have next structure:
- Subfolders of project path should represent date of experiment. 
  - Format: `YYYY-MM-DD` (`YYYY` - year, `MM` - month number, `DD` - day number)
- Subfolders of date should represent node. 
  - Format: `#<node_id>_<node_name>_HHMMSS`
    - `node_id` should be unique sequential integer value (index of node), starting at 1.
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

Files:
- `node.json` --  [required] [common node description](./node_json.md)
- `state.json` -- [optional] quam snapshot description.
- `data.json` -- [optional] [output file](#timeline_db-type).
- Other figures, arrays, and ancillary files.


`data.json` file contains output results of experiments. Content should be 
valid json. It's also possible to have image references (only `.png` is 
supported now) in this file. Images path should be subpath of node path.

**Example**:

Files structure:
```
2024-04-29
└── #1_name1_180203
    ├── data.json
    ├── histogram.png
    ├── heatmap.png
    ├── node.json
    └── state.json
```

#### `data.json`

```json
{
  "key": "value",
  "images": {
    "data_histogram": "./histogram.png",
    "data_heat": "./heatmap.png"
  }
}
```

#### `node.json`

For details see [Node JSON](./node_json.md).

```json
{
    "created_at": "2024-04-29T18:02:03+02:00",
    "metadata": {
        "name": "name1",
        "data_path": "2024-04-29/#01_name1_180203"
    },
    "data": {
        "quam": "./state.json"
    },
    "id": 1,
    "parents": [0]
}