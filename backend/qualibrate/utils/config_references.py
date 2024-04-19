from collections import defaultdict
from typing import Any, Mapping, Optional, Sequence, Set, cast

import jsonpatch
import jsonpointer
from pydantic import BaseModel

TEMPLATE_START = "${#"


class Reference(BaseModel):
    config_path: str
    reference_path: str
    index_start: int
    index_end: int
    value: Any = None
    solved: bool = False


class PathWithSolvingReferences(BaseModel):
    config_path: str
    value: Any = None
    solved: bool = False
    references: list[Reference] = []


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
            template_start_index = value.find(TEMPLATE_START)
            while template_start_index != -1:
                template_end_index = value.find("}", template_start_index)
                if template_end_index == -1:
                    break
                to_resolve.append(
                    Reference(
                        config_path=config_path,
                        reference_path=value[
                            template_start_index + 3 : template_end_index
                        ].strip(),
                        index_start=template_start_index,
                        index_end=template_end_index,
                    )
                )
                template_start_index = value.find(
                    TEMPLATE_START, template_end_index + 1
                )
    return to_resolve


def check_cycles_in_references(references: Mapping[str, Sequence[str]]) -> bool:
    """Return True if the references has a cycle.

    >>> check_cycles_in_references({"a": ("b",), "b": ("c",), "c": ("a",)})
    True
    >>> check_cycles_in_references({"a": ("b",), "b": ("c",), "c": ("d",)})
    False

    """
    path: Set[str] = set()
    visited: Set[str] = set()

    def visit(vertex: str) -> bool:
        if vertex in visited:
            return False
        visited.add(vertex)
        path.add(vertex)
        for neighbour in references.get(vertex, ()):
            if neighbour in path or visit(neighbour):
                return True
        path.remove(vertex)
        return False

    return any(visit(v) for v in references)


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
                raise ValueError("subref not solved")
            ref.value = solved_references[ref.reference_path]
            ref.solved = True
        else:
            value = jsonpointer.resolve_pointer(
                original_config, ref.reference_path, None
            )
            if value is None:
                raise ValueError("can't resolve ref item")
            ref.value = value
            ref.solved = True
            solved_references[ref.reference_path] = value
    verify_all_solved = all(map(lambda ref: ref.solved, references))
    if not verify_all_solved:
        raise ValueError("some issues with solving")
    config_value = jsonpointer.resolve_pointer(
        original_config, config_item.config_path, None
    )
    if config_value is None or not isinstance(config_value, str):
        raise ValueError("can't resolve config item")
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
    has_cycles = check_cycles_in_references(references_seq)
    if has_cycles:
        raise ValueError("Config contains cycles")
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
        "data_handler": {
            "root_data_folder": "/data/${#/data_handler/project}/subpath",
            "project": "${#/qualibrate/project}",
        },
    }
    res = resolve_references(_config)
    print(_config)
    print(res)
    # print(has_cycles)
