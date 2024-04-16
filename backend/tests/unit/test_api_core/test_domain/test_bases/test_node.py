from datetime import datetime

import pytest

from qualibrate.api.core.domain.bases.node import NodeBase, NodeLoadType
from qualibrate.api.core.domain.bases.snapshot import (
    SnapshotLoadType,
)
from qualibrate.api.core.models.node import Node
from qualibrate.api.core.models.snapshot import SimplifiedSnapshotWithMetadata
from qualibrate.api.core.models.storage import Storage
from qualibrate.api.exceptions.classes.storage import QNotADirectoryException


class NodeBaseCustom(NodeBase):
    pass


def test_init():
    n = NodeBaseCustom(1, None)
    assert n._node_id == 1
    assert n._load_type == NodeLoadType.Empty


def test_load_type():
    n = NodeBaseCustom(1, None)
    assert n.load_type == NodeLoadType.Empty
    n._load_type = NodeLoadType.Snapshot
    assert n.load_type == NodeLoadType.Snapshot
    n._load_type = NodeLoadType.Full
    assert n.load_type == NodeLoadType.Full


def test_load_node_loaded():
    class _Snapshot:
        loaded = False

        def load(self, load_type):
            assert load_type == SnapshotLoadType.Metadata
            self.loaded = True

    s = _Snapshot()
    n = NodeBaseCustom(1, s)
    n._load_type = NodeLoadType.Full

    n.load(NodeLoadType.Snapshot)
    assert not s.loaded
    n.load(NodeLoadType.Full)
    assert not s.loaded


def test_load_snapshot(mocker):
    class _Snapshot:
        loaded = False

        def load(self, load_type):
            self.loaded = True

    s = _Snapshot()
    n = NodeBaseCustom(1, s)
    patched_fill_storage = mocker.patch.object(n, "_fill_storage")
    n.load(NodeLoadType.Snapshot)
    assert s.loaded
    patched_fill_storage.assert_not_called()


def test_load_full(mocker):
    class _Snapshot:
        loaded = False

        def load(self, load_type):
            self.loaded = True

    s = _Snapshot()
    n = NodeBaseCustom(1, s)
    patched_fill_storage = mocker.patch.object(n, "_fill_storage")
    n.load(NodeLoadType.Full)
    assert s.loaded
    patched_fill_storage.assert_called_once()


@pytest.mark.parametrize(
    "meta", (None, {"not_out_path": None}, {"out_path": 1})
)
def test__fill_storage_metadata_issue(mocker, meta):
    class _Settings:
        metadata_out_path = "out_path"

    class _Snapshot:
        metadata = meta

    mocker.patch(
        "qualibrate.api.core.domain.bases.node.get_settings",
        return_value=_Settings(),
    )
    resolve_patched = mocker.patch(
        "qualibrate.api.core.domain.bases.node.resolve_and_check_relative"
    )
    n = NodeBaseCustom(1, _Snapshot())
    assert n._fill_storage() is None
    assert n._storage is None
    assert n._load_type == NodeLoadType.Snapshot
    resolve_patched.assert_not_called()


def test__fill_storage_no_output_path(mocker, tmp_path):
    node_path = "data_path"

    class _Settings:
        user_storage = tmp_path
        metadata_out_path = "out_path"

    class _Snapshot:
        metadata = {_Settings.metadata_out_path: node_path}

    mocker.patch(
        "qualibrate.api.core.domain.bases.node.get_settings",
        return_value=_Settings(),
    )
    resolve_patched = mocker.patch(
        "qualibrate.api.core.domain.bases.node.resolve_and_check_relative",
        return_value=tmp_path / "node",
    )
    mocker.patch("pathlib.Path.is_dir", return_value=False)
    dfs_patched = mocker.patch(
        "qualibrate.api.core.domain.bases.node.DataFileStorage"
    )
    n = NodeBaseCustom(1, _Snapshot())
    with pytest.raises(QNotADirectoryException) as ex:
        n._fill_storage()
    assert ex.type == QNotADirectoryException
    assert ex.value.args == (f"{node_path} is not a directory",)
    resolve_patched.assert_called_once_with(tmp_path, node_path)
    dfs_patched.assert_not_called()


def test__fill_storage_valid(mocker, tmp_path):
    rel_node_path = "data_path"
    abs_node_path = tmp_path / rel_node_path

    class _Settings:
        user_storage = tmp_path
        metadata_out_path = "out_path"

    class _Snapshot:
        metadata = {_Settings.metadata_out_path: rel_node_path}

    mocker.patch(
        "qualibrate.api.core.domain.bases.node.get_settings",
        return_value=_Settings(),
    )
    resolve_patched = mocker.patch(
        "qualibrate.api.core.domain.bases.node.resolve_and_check_relative",
        return_value=abs_node_path,
    )
    mocker.patch("pathlib.Path.is_dir", return_value=True)
    dfs_patched = mocker.patch(
        "qualibrate.api.core.domain.bases.node.DataFileStorage"
    )
    n = NodeBaseCustom(1, _Snapshot())
    assert n._fill_storage() is None
    resolve_patched.assert_called_once_with(tmp_path, rel_node_path)
    dfs_patched.assert_called_once_with(abs_node_path)


def test_dump_no_storage(mocker):
    created_at = datetime.now().astimezone()
    s_dumped = {
        "id": 1,
        "created_at": created_at,
        "parents": [],
        "metadata": {},
    }

    class _Snapshot:
        def dump(self):
            return type("_Model", tuple(), {"model_dump": lambda: s_dumped})

    n = NodeBaseCustom(1, _Snapshot())
    patched_dfs_dump = mocker.patch(
        "qualibrate.api.core.domain.bases.storage.DataFileStorage.dump"
    )
    assert n.dump() == Node(
        id=1, snapshot=SimplifiedSnapshotWithMetadata(**s_dumped), storage=None
    )
    patched_dfs_dump.assert_not_called()


def test_dump_with_storage(mocker):
    created_at = datetime.now().astimezone()
    sn_dumped = {
        "id": 1,
        "created_at": created_at,
        "parents": [],
        "metadata": {},
    }
    st_dump = {"path": "./data.json", "data": {}}

    class _Snapshot:
        def dump(self):
            return type("_Model", tuple(), {"model_dump": lambda: sn_dumped})

    n = NodeBaseCustom(1, _Snapshot())
    storage = mocker.MagicMock()
    storage.dump = mocker.MagicMock(return_value=Storage(**st_dump))
    n._storage = storage
    assert n.dump() == Node(
        id=1,
        snapshot=SimplifiedSnapshotWithMetadata(**sn_dumped),
        storage=Storage(**st_dump),
    )
