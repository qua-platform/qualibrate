from collections.abc import Mapping, Sequence
from typing import Any

from jsonpointer import resolve_pointer


class _Placeholder:
    pass


def jsonpatch_to_mapping(
    old: Mapping[str, Any], patch: Sequence[Mapping[str, Any]]
) -> Mapping[str, Mapping[str, Any]]:
    diff: dict[str, dict[str, Any]] = {}
    for item in patch:
        op = item["op"]
        if op == "replace":
            old_value = resolve_pointer(old, item["path"])
            diff[item["path"]] = {
                "old": old_value,
                "new": item["value"],
            }
        elif op == "remove":
            old_value = resolve_pointer(old, item["path"])
            diff[item["path"]] = {
                "old": old_value,
            }
        elif op == "add":
            diff[item["path"]] = {
                "new": item["value"],
            }
        elif op == "copy":
            new_dst_value = resolve_pointer(old, item["from"])
            old_dst_value = resolve_pointer(old, item["path"], _Placeholder())
            diff[item["path"]] = {
                "new": new_dst_value,
            }
            if not isinstance(old_dst_value, _Placeholder):
                diff[item["path"]]["old"] = old_dst_value
        elif op == "move":
            old_src_value = resolve_pointer(old, item["from"])
            old_dst_value = resolve_pointer(old, item["path"], _Placeholder())
            if item["from"] not in diff:
                diff[item["from"]] = {
                    "old": old_src_value,
                }
            diff[item["path"]] = {
                "new": old_src_value,
            }
            if not isinstance(old_dst_value, _Placeholder):
                diff[item["path"]]["old"] = old_dst_value
    return diff
