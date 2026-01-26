from importlib.util import module_from_spec, spec_from_file_location
from pathlib import Path
from types import ModuleType

__all__ = [
    "get_module_name",
    "import_from_path",
    "import_from_path_exec",
    "import_from_path_importlib",
]


def get_module_name(file_path: Path) -> str:
    """Create module name from file path."""
    return f"_node_{file_path.stem}"


def import_from_path(module_name: str, file_path: Path) -> ModuleType:
    try:
        return import_from_path_importlib(module_name, file_path)
    except UnicodeError:
        return import_from_path_exec(module_name, file_path)


def import_from_path_importlib(module_name: str, file_path: Path) -> ModuleType:
    """Import a module given its name and file path."""
    spec = spec_from_file_location(module_name, file_path)
    if spec is None:
        raise RuntimeError(f"Can't read spec from {file_path}")
    module = module_from_spec(spec)
    if spec.loader is None:
        raise RuntimeError(f"Can't get loader from spec of file {file_path}")
    spec.loader.exec_module(module)
    return module


def import_from_path_exec(module_name: str, file_path: Path, encoding: str = "utf-8") -> ModuleType:
    """Import a module from a file with enforced UTF-8 encoding."""
    source = file_path.read_text(encoding=encoding)
    module = ModuleType(module_name)
    module.__file__ = str(file_path)
    exec(compile(source, str(file_path), "exec"), module.__dict__)
    return module
