from collections import defaultdict
from collections.abc import Mapping, Sequence
from typing import Any, Optional, cast

import jsonpatch
import jsonpointer

from qualibrate_app.config.references.models import (
    PathWithSolvingReferences,
    Reference,
)

TEMPLATE_START = "${#"


def find_references_in_str(
    to_search: str, config_path: str
) -> Sequence[Reference]:
    to_resolve: list[Reference] = []
    template_start_index = to_search.find(TEMPLATE_START)
    while template_start_index != -1:
        template_end_index = to_search.find("}", template_start_index)
        if template_end_index == -1:
            return to_resolve
        to_resolve.append(
            Reference(
                config_path=config_path,
                reference_path=to_search[
                    template_start_index + 3 : template_end_index
                ].strip(),
                index_start=template_start_index,
                index_end=template_end_index,
            )
        )
        template_start_index = to_search.find(
            TEMPLATE_START, template_end_index + 1
        )
    return to_resolve


def find_all_references(
    document: Mapping[str, Any], current_path: Optional[list[str]] = None
) -> Sequence[Reference]:
    if current_path is None:
        current_path = []
    to_resolve: list[Reference] = []
    for key, value in document.items():
        if isinstance(value, Mapping):
            to_resolve.extend(find_all_references(value, current_path + [key]))
        elif isinstance(value, str):
            config_path = "/" + "/".join(current_path + [key])
            to_resolve.extend(find_references_in_str(value, config_path))
    return to_resolve


def check_cycles_in_references(
    references: Mapping[str, Sequence[str]],
) -> tuple[bool, Optional[Sequence[str]]]:
    """Return True if the references has a cycle.

    >>> check_cycles_in_references({"a": ("b",), "b": ("c",), "c": ("a",)})
    (True, ['a', 'b', 'c', 'a'])
    >>> check_cycles_in_references({"a": ("b",), "b": ("c",), "c": ("d",)})
    (False, None)

    """
    path: list[str] = []
    visited: set[str] = set()
    cycled_item: str = ""

    def visit(vertex: str) -> bool:
        nonlocal cycled_item
        if vertex in visited:
            return False
        visited.add(vertex)
        path.append(vertex)
        for neighbour in references.get(vertex, ()):
            if neighbour in path or visit(neighbour):
                cycled_item = vertex
                return True
        path.pop()  # == path.remove(vertex):
        return False

    if any(visit(v) for v in references):
        return True, [*path, cycled_item]
    return False, None


def _resolve_references(
    path: str,
    path_with_references: dict[str, PathWithSolvingReferences],
    original_config: Mapping[str, Any],
    solved_references: dict[str, Any],
) -> None:
    if path_with_references[path].solved:
        # path already solved
        return
    config_item = path_with_references[path]
    references: list[Reference] = config_item.references
    not_solved_refs = filter(lambda ref: not ref.solved, references)
    for ref in not_solved_refs:
        if ref.reference_path in solved_references:
            ref.value = solved_references[ref.reference_path]
            ref.solved = True
        elif ref.reference_path in path_with_references:
            _resolve_references(
                ref.reference_path,
                path_with_references,
                original_config,
                solved_references,
            )
            if ref.reference_path not in solved_references:
                raise ValueError(
                    f"Subreference '{ref.reference_path}' "
                    f"for '{ref.config_path}' not solved."
                )
            ref.value = solved_references[ref.reference_path]
            ref.solved = True
        else:
            value = jsonpointer.resolve_pointer(
                original_config, ref.reference_path, None
            )
            if value is None:
                raise ValueError(
                    f"Can't resolve reference item '{ref.reference_path}' "
                    f"for config path '{ref.config_path}'"
                )
            ref.value = value
            ref.solved = True
            solved_references[ref.reference_path] = value
    verify_all_solved = all(map(lambda ref: ref.solved, references))
    if not verify_all_solved:
        not_solved_refs = filter(lambda ref: not ref.solved, references)
        references_errors = (
            (
                f"- config path: '{ref.config_path}', "
                f"reference: '{ref.reference_path}';"
            )
            for ref in not_solved_refs
        )
        raise ValueError(
            "\n".join(
                [
                    "Some issues with solving references. Issued references:",
                    *references_errors,
                ]
            )
        )
    config_value = jsonpointer.resolve_pointer(
        original_config, config_item.config_path, None
    )
    if config_value is None or not isinstance(config_value, str):
        raise ValueError(
            f"Can't resolve config item '{config_item.config_path}'"
        )
    for ref in sorted(
        references, key=lambda ref: ref.index_start, reverse=True
    ):
        config_value = (
            f"{config_value[:ref.index_start]}"
            f"{ref.value}{config_value[ref.index_end + 1:]}"
        )
    config_item.value = config_value
    config_item.solved = True
    solved_references[config_item.config_path] = config_value


def resolve_references(config: dict[str, Any]) -> dict[str, Any]:
    references = find_all_references(config)
    references_seq = defaultdict(list)
    for reference in references:
        references_seq[reference.config_path].append(reference.reference_path)
    has_cycles, cycle = check_cycles_in_references(references_seq)
    if has_cycles:
        raise ValueError(f"Config contains cycle: {cycle}")
    solved_references: dict[str, Any] = {}
    path_with_references: dict[str, PathWithSolvingReferences] = {}
    for reference in references:
        path_with_refs = path_with_references.setdefault(
            reference.config_path,
            PathWithSolvingReferences(config_path=reference.config_path),
        )
        path_with_refs.references.append(reference)
    for path in path_with_references:
        _resolve_references(
            path,
            path_with_references,
            config,
            solved_references,
        )
    patches = [
        {"op": "replace", "path": path.config_path, "value": path.value}
        for path in path_with_references.values()
    ]
    return cast(dict[str, Any], jsonpatch.apply_patch(config, patches))


if __name__ == "__main__":
    _config = {
        "qualibrate": {"project": "my_project"},
        # "qualibrate": {"project": "${#/data_handler/project}"},
        "data_handler": {
            "root_data_folder": "/data/${#/data_handler/project}/subpath",
            "project": "${#/qualibrate/project}",
            # "project": "${#/qualibrate/project_}",
        },
    }
    res = resolve_references(_config)
    print(_config)
    print(res)
