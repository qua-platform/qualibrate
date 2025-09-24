from collections import UserDict, UserList
from types import NoneType
from typing import TYPE_CHECKING, Any, Optional, TypeVar

import jsonpatch
import jsonpointer
from quam.utils import string_reference

from qualibrate.parameters import NodeParameters
from qualibrate.utils.logger_m import logger
from qualibrate.utils.type_protocols import MachineProtocol

if TYPE_CHECKING:
    from qualibrate.qualibration_node import QualibrationNode

__all__ = [
    "record_state_update",
    "update_machine_attribute",
    "update_node_machine",
]

ParametersType = TypeVar("ParametersType", bound=NodeParameters)
MachineType = TypeVar("MachineType", bound=MachineProtocol)
ValueTypeToRecord = (int, float, str, NoneType)


def _record_state_update(
    node: Optional["QualibrationNode[ParametersType, MachineType]"],
    reference: str,
    attr: str,
    old: Any,
    val: Any,
) -> None:
    """
    Records state updates for an attribute or item in the node.

    This function stores information about changes made to an attribute
    or item of a node, including the previous value and the new value.
    If the node is provided, the change details are saved in the node's
    `_state_updates` dictionary.

    Args:
        node: The node where the state update will be recorded. If None, no
            action is performed.
        reference: The reference key to identify the updated attribute or item.
        attr: The name of the attribute or item key that is updated.
        old: The old value of the attribute or item before the update.
        val: The new value of the attribute or item.
    """
    if node is None:
        return
    if isinstance(old, UserList):
        old = list(old)
    elif isinstance(old, UserDict):
        old = dict(old)
    node._state_updates[reference] = {
        "key": reference,
        "attr": attr,
        "old": old,
        "new": val,
    }


def record_state_update(
    node: "QualibrationNode[ParametersType, MachineType]",
    reference: str,
    attr: str,
    old: Any,
    val: Any = None,
) -> None:
    """
    Records item state updates in a Quam collection object.

    For details see `_record_state_update`.

    Args:
        node: The node where the state update will be recorded. Defaults to
            None.
        attr: The name of the attribute being updated.
        old: The old value of the attribute or item.
        val: The new value of the attribute or item. Defaults to None.
    """
    _record_state_update(node, reference, attr, old, val)


def update_machine_attribute(
    machine: MachineType,
    quam_path: str,
    old_value: Any,
) -> str | int:
    ref_path, str_key = string_reference.split_reference(quam_path)
    try:
        key = int(str_key)
    except ValueError:
        key = str_key
    referenced_value = string_reference.get_referenced_value(
        machine, ref_path, root=machine.get_root()
    )
    if isinstance(referenced_value, (list, UserList)) and isinstance(key, int):
        referenced_value[key] = old_value
        return key
    if isinstance(referenced_value, (dict, UserDict)):
        if str_key in referenced_value:
            referenced_value[str_key] = old_value
            return str(str_key)
        if key in referenced_value:
            referenced_value[key] = old_value
            return key
    setattr(referenced_value, str_key, old_value)
    return key


def update_node_machine(
    node: "QualibrationNode[ParametersType, MachineType]",
    original_dict: dict[str, Any],
    updated_dict: dict[str, Any],
) -> None:
    if node.machine is None:
        return
    patches: jsonpatch.JsonPatch = jsonpatch.make_patch(
        original_dict, updated_dict
    )
    for patch in patches.patch:
        if patch["op"] != "replace" or not isinstance(
            patch["value"], ValueTypeToRecord
        ):
            continue
        path_ptr = jsonpointer.JsonPointer(patch["path"])
        try:
            old_value = jsonpointer.resolve_pointer(
                original_dict, path_ptr.path
            )
        except jsonpointer.JsonPointerException as ex:
            logger.exception(ex)
            continue
        if (
            string_reference.is_reference(old_value)
            or string_reference.is_reference(patch["value"])
            or not isinstance(old_value, ValueTypeToRecord)
        ):
            continue
        quam_path = f"#{path_ptr.path}"
        attr = update_machine_attribute(node.machine, quam_path, old_value)
        record_state_update(
            node=node,
            reference=quam_path,
            attr=str(attr),
            old=old_value,
            val=patch["value"],
        )
