from importlib.util import module_from_spec, spec_from_file_location
from pathlib import Path
from types import ModuleType


def get_module_name(file_path: Path) -> str:
    """Create module name from file path."""
    return f"_node_{file_path.stem}"


def import_from_path(module_name: str, file_path: Path) -> ModuleType:
    """Import a module given its name and file path."""
    spec = spec_from_file_location(module_name, file_path)
    if spec is None:
        raise RuntimeError(f"Can't read spec from {file_path}")
    module = module_from_spec(spec)
    if spec.loader is None:
        raise RuntimeError(f"Can't get loader from spec of file {file_path}")
    spec.loader.exec_module(module)
    return module
