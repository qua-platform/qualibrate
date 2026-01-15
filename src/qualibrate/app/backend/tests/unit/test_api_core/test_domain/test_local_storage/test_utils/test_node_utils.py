from pathlib import Path
from unittest.mock import PropertyMock

import pytest

from qualibrate_app.api.core.domain.local_storage.utils import node_utils
from qualibrate_app.api.core.utils.path.node import NodePath


def test_find_latest_node_data_exists(mocker):
    mocker.patch.object(
        NodePath, "id", new_callable=PropertyMock, side_effect=[1, 5, None, 3]
    )
    glob_res = iter(["#1", "#5_", "#name", "#3"])
    mocker.patch("pathlib.Path.glob", return_value=glob_res)
    assert node_utils.find_latest_node(Path("/some_path")) == NodePath("#5_")


def test_find_latest_node_data_not_exists(mocker):
    mocker.patch("pathlib.Path.glob", return_value=iter([]))
    assert node_utils.find_latest_node(Path("/some_path")) is None


@pytest.mark.parametrize("id_res, ret_val", [(2, 2), (None, -1)])
def test_find_latest_node_id_node_specified(mocker, id_res, ret_val):
    node_path = NodePath("/path")
    mocker.patch.object(
        node_path.__class__,
        "id",
        new_callable=PropertyMock,
        return_value=id_res,
    )
    mocker.patch(
        (
            "qualibrate_app.api.core.domain.local_storage.utils.node_utils"
            ".find_latest_node"
        ),
        return_value=node_path,
    )
    assert node_utils.find_latest_node_id(Path("/some_path")) == ret_val


def test_find_latest_node_id_node_unspecified(mocker):
    mocker.patch(
        (
            "qualibrate_app.api.core.domain.local_storage.utils.node_utils"
            ".find_latest_node"
        ),
        return_value=None,
    )
    assert node_utils.find_latest_node_id(Path("/some_path")) == -1


# TODO: test test_find_n_latest_nodes
# @pytest.mark.parametrize(
#     "page, per_page, expected", [
#         (1, 3, )
# )
# def test_find_n_latest_nodes_ids_expected_greater_than_exists(
#     mocker, tmp_path, requested_count
# ):
#     mocker.patch(
#         (
#             "qualibrate_app.api.core.domain.local_storage.utils.node_utils"
#             ".get_node_id_name_time"
#         ),
#         side_effect=[(i, None, None) for i in range(4, 0, -1)],
#     )
#     for d_idx, date in enumerate(("2024-04-17", "2024-04-18")):
#         date_path = tmp_path / date
#         date_path.mkdir()
#         for n_idx in range(2):
#             (date_path / f"#{d_idx * 2 + n_idx}_name_time").mkdir()
#
#     result = node_utils.find_n_latest_nodes_ids(tmp_path, requested_count)
#     assert isinstance(result, Generator)
#     assert list(result) == [4 - i for i in range(min(requested_count, 4))]
