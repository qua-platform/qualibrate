import click
from qualibrate_config.cli.config import config_command

from qualibrate_runner.cli import start_command


@click.group()
def cli() -> None:
    pass


cli.add_command(config_command)
cli.add_command(start_command)


def main() -> None:
    cli(auto_envvar_prefix="QUALIBRATE_RUNNER")


if __name__ == "__main__":
    main()
