from inspect import isclass
from typing import Any


def get_full_class_path(cls_or_obj: Any) -> str:
    """Returns the full path of a class, including the module name.

    Args:
        cls_or_obj: The class to get the path of.

    Returns:
        The full path of the class or object. Generally this is of the form
        "module_name.class_name".
    """
    if not isclass(cls_or_obj):
        cls_or_obj = cls_or_obj.__class__
    class_name = cls_or_obj.__qualname__
    module_name = cls_or_obj.__module__
    if module_name in ("__main__", "builtins") or module_name is None:
        return str(class_name)
    return f"{module_name}.{class_name}"
