from datetime import datetime
from typing import Optional, Sequence

import pytest
from pydantic import ValidationError

from qualibrate.api.core.domain.bases.branch import BranchBase, BranchLoadType
from qualibrate.api.core.domain.bases.node import NodeBase
from qualibrate.api.core.domain.bases.snapshot import SnapshotBase
from qualibrate.api.core.types import IdType


class CustomBranchBase(BranchBase):
    @property
    def created_at(self) -> Optional[datetime]:
        raise NotImplementedError

    def load(self, load_type: BranchLoadType) -> None:
        raise NotImplementedError

    def get_snapshot(self, id: Optional[IdType] = None) -> SnapshotBase:
        raise NotImplementedError

    def get_node(self, id: Optional[IdType] = None) -> NodeBase:
        raise NotImplementedError

    def get_latest_snapshots(self, num: int = 50) -> Sequence[SnapshotBase]:
        raise NotImplementedError

    def get_latest_nodes(self, num: int = 50) -> Sequence[NodeBase]:
        raise NotImplementedError


def test_creation_no_content():
    branch = CustomBranchBase("name1")
    assert branch._name == "name1"
    assert branch.content == {}
    assert branch._load_type == BranchLoadType.Empty


def test_creation_with_content():
    branch = CustomBranchBase("name2", {"key": "value"})
    assert branch._name == "name2"
    assert branch.content == {"key": "value"}
    assert branch._load_type == BranchLoadType.Full


def test_name():
    assert CustomBranchBase("name1").name == "name1"
    assert CustomBranchBase("name2").name == "name2"


def test_load_type():
    branch = CustomBranchBase("name1")
    branch._load_type = BranchLoadType.Empty
    assert branch.load_type == BranchLoadType.Empty
    branch._load_type = BranchLoadType.Full
    assert branch.load_type == BranchLoadType.Full


def test_branch_dump_not_filled():
    branch = CustomBranchBase("name")
    with pytest.raises(ValidationError) as ex:
        branch.dump()
    assert ex.type == ValidationError
    got_errors = [
        {"type": error["type"], "loc": error["loc"], "msg": error["msg"]}
        for error in sorted(ex.value.errors(), key=lambda e: e["loc"])
    ]
    expected_errors = [
        {
            "type": "missing",
            "loc": loc,
            "msg": "Field required",
        }
        for loc in [
            ("created_at",),
            ("id",),
            ("snapshot_id",),
        ]
    ]
    assert got_errors == expected_errors
