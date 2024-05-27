# `qualibrate start`

Command for starting qualibrate

> qualibrate start [--config-path PATH] [--port INTEGER] [--num-workers INTEGER]

- `--config-path` (default: `~/.qualibrate/config.toml`): Path to 
    [config file](./config.md#configtoml-file). File can be generated 
    (check [page](./config.md#qualibrate-config-command))
- `--port` (default: `8001`): Application will be started on the given port
- `--num-workers` (default: `1`): Number of workers. 
    Check [uvicorn docs](https://www.uvicorn.org/deployment/)