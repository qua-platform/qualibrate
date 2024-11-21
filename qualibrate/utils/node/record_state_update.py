from collections import UserDict, UserList
from typing import TYPE_CHECKING, Any, Optional, TypeVar

from qualibrate.parameters import NodeParameters
from qualibrate.utils.type_protocols import (
    GetRefGetItemProtocol,
    GetRefProtocol,
)

if TYPE_CHECKING:
    from qualibrate.qualibration_node import QualibrationNode


__all__ = [
    "record_state_update_getattr",
    "record_state_update_getitem",
]

ParametersType = TypeVar("ParametersType", bound=NodeParameters)


def _record_state_update(
    node: Optional["QualibrationNode[ParametersType]"],
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


def record_state_update_getattr(
    quam_obj: GetRefProtocol,
    attr: str,
    val: Any = None,
    node: Optional["QualibrationNode[ParametersType]"] = None,
) -> None:
    """
    Records item state updates in a Quam collection object.

    For details see `_record_state_update`.

    Args:
        quam_obj: The Quam object whose attribute is updated.
        attr: The name of the attribute being updated.
        val: The new value of the attribute. Defaults to None.
        node: The node where the state update will be recorded. Defaults to
            None.
    """
    _record_state_update(
        node, quam_obj.get_reference(attr), attr, getattr(quam_obj, attr), val
    )


def record_state_update_getitem(
    quam_obj: GetRefGetItemProtocol,
    attr: str,
    val: Any = None,
    node: Optional["QualibrationNode[ParametersType]"] = None,
) -> None:
    """
    Records item state updates in a Quam collection object.

    For details see `_record_state_update`.

    Args:
        quam_obj: The Quam object whose item is being updated.
        attr: The key/index of the item being updated.
        val: The new value of the item. Defaults to None.
        node: The node where the state update will be recorded. Defaults to
            None.
    """
    _record_state_update(
        node, quam_obj.get_reference(attr), attr, quam_obj[attr], val
    )
