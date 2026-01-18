from datetime import datetime

import pytest

from qualibrate_app.api.core.domain.bases.node import NodeBase, NodeLoadType
from qualibrate_app.api.core.domain.bases.snapshot import (
    SnapshotLoadType,
)
from qualibrate_app.api.core.models.node import Node
from qualibrate_app.api.core.models.snapshot import (
    SimplifiedSnapshotWithMetadata,
)
from qualibrate_app.api.core.models.storage import Storage
from qualibrate_app.api.exceptions.classes.storage import (
    QNotADirectoryException,
)
from qualibrate_app.config.vars import METADATA_OUT_PATH


class NodeBaseCustom(NodeBase):
    pass


def test_init(settings):
    n = NodeBaseCustom(1, None, settings=settings)
    assert n._node_id == 1
    assert n._load_type == NodeLoadType.Empty


def test_load_type(settings):
    n = NodeBaseCustom(1, None, settings=settings)
    assert n.load_type == NodeLoadType.Empty
    n._load_type = NodeLoadType.Snapshot
    assert n.load_type == NodeLoadType.Snapshot
    n._load_type = NodeLoadType.Full
    assert n.load_type == NodeLoadType.Full


def test_load_node_loaded(settings):
    class _Snapshot:
        loaded = False

        def load(self, load_type):
            assert load_type == SnapshotLoadType.Metadata
            self.loaded = True

    s = _Snapshot()
    n = NodeBaseCustom(1, s, settings=settings)
    n._load_type = NodeLoadType.Full

    n.load(NodeLoadType.Snapshot)
    assert not s.loaded
    n.load(NodeLoadType.Full)
    assert not s.loaded


def test_load_snapshot(mocker, settings):
    class _Snapshot:
        loaded = False

        def load_from_flag(self, load_type_flag):
            self.loaded = True

    s = _Snapshot()
    n = NodeBaseCustom(1, s, settings=settings)
    patched_fill_storage = mocker.patch.object(n, "_fill_storage")
    n.load(NodeLoadType.Snapshot)
    assert s.loaded
    patched_fill_storage.assert_not_called()


def test_load_full(mocker, settings):
    class _Snapshot:
        loaded = False

        def load_from_flag(self, load_type):
            self.loaded = True

    s = _Snapshot()
    n = NodeBaseCustom(1, s, settings=settings)
    patched_fill_storage = mocker.patch.object(n, "_fill_storage")
    n.load(NodeLoadType.Full)
    assert s.loaded
    patched_fill_storage.assert_called_once()


@pytest.mark.parametrize(
    "meta", (None, {"not_out_path": None}, {"out_path": 1})
)
def test__fill_storage_metadata_issue(mocker, meta, settings):
    class _Snapshot:
        metadata = meta

    resolve_patched = mocker.patch(
        "qualibrate_app.api.core.domain.bases.node.resolve_and_check_relative"
    )
    n = NodeBaseCustom(1, _Snapshot(), settings=settings)
    assert n._fill_storage() is None
    assert n._storage is None
    assert n._load_type == NodeLoadType.Snapshot
    resolve_patched.assert_not_called()


def test__fill_storage_no_output_path(mocker, settings):
    node_path = "data_path"

    class _Snapshot:
        metadata = {METADATA_OUT_PATH: node_path}

    resolve_patched = mocker.patch(
        "qualibrate_app.api.core.domain.bases.node.resolve_and_check_relative",
        return_value=settings.storage.location / "node",
    )
    mocker.patch("pathlib.Path.is_dir", return_value=False)
    dfs_patched = mocker.patch(
        "qualibrate_app.api.core.domain.bases.node.DataFileStorage"
    )
    n = NodeBaseCustom(1, _Snapshot(), settings=settings)
    with pytest.raises(QNotADirectoryException) as ex:
        n._fill_storage()
    assert ex.type == QNotADirectoryException
    assert ex.value.args == (f"{node_path} is not a directory",)
    resolve_patched.assert_called_once_with(
        settings.storage.location, node_path
    )
    dfs_patched.assert_not_called()


def test__fill_storage_valid(mocker, settings):
    rel_node_path = "data_path"
    abs_node_path = settings.storage.location / rel_node_path

    class _Snapshot:
        metadata = {METADATA_OUT_PATH: rel_node_path}

    resolve_patched = mocker.patch(
        "qualibrate_app.api.core.domain.bases.node.resolve_and_check_relative",
        return_value=abs_node_path,
    )
    mocker.patch("pathlib.Path.is_dir", return_value=True)
    dfs_patched = mocker.patch(
        "qualibrate_app.api.core.domain.bases.node.DataFileStorage"
    )
    n = NodeBaseCustom(1, _Snapshot(), settings=settings)
    assert n._fill_storage() is None
    resolve_patched.assert_called_once_with(
        settings.storage.location, rel_node_path
    )
    dfs_patched.assert_called_once_with(abs_node_path, settings)


def test_dump_no_storage(mocker, settings):
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

    n = NodeBaseCustom(1, _Snapshot(), settings=settings)
    patched_dfs_dump = mocker.patch(
        "qualibrate_app.api.core.domain.bases.storage.DataFileStorage.dump"
    )
    assert n.dump() == Node(
        id=1, snapshot=SimplifiedSnapshotWithMetadata(**s_dumped), storage=None
    )
    patched_dfs_dump.assert_not_called()


def test_dump_with_storage(mocker, settings):
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

    n = NodeBaseCustom(1, _Snapshot(), settings=settings)
    storage = mocker.MagicMock()
    storage.dump = mocker.MagicMock(return_value=Storage(**st_dump))
    n._storage = storage
    assert n.dump() == Node(
        id=1,
        snapshot=SimplifiedSnapshotWithMetadata(**sn_dumped),
        storage=Storage(**st_dump),
    )
