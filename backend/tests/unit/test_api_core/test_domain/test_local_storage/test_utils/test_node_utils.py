from datetime import time
from pathlib import Path
from typing import Generator

import pytest

from qualibrate.api.core.domain.local_storage.utils import node_utils


@pytest.mark.parametrize("stem", ("no-underscore", "single_underscode"))
def test_get_node_id_name_time_less_parts(stem):
    assert node_utils.get_node_id_name_time(Path(stem)) == (None, stem, None)


def test_get_node_id_name_time_id_not_starts_with_hash():
    stem = "11_name_120000"
    assert node_utils.get_node_id_name_time(Path(stem)) == (None, stem, None)


def test_get_node_id_name_time_id_not_numeric():
    stem = "#1a_name_120000"
    assert node_utils.get_node_id_name_time(Path(stem)) == (None, stem, None)


@pytest.mark.parametrize("name", ("no-underscore", "has_underscode"))
def test_get_node_id_name_time_valid(name):
    stem = f"#11_{name}_120000"
    assert node_utils.get_node_id_name_time(Path(stem)) == (
        11,
        name,
        time(12, 0, 0),
    )


@pytest.mark.parametrize("requested_count", [3, 4, 5])
def test_find_n_latest_nodes_ids_expected_greater_than_exists(
    mocker, tmp_path, requested_count
):
    mocker.patch(
        (
            "qualibrate.api.core.domain.local_storage.utils.node_utils"
            ".get_node_id_name_time"
        ),
        side_effect=[(i, None, None) for i in range(4, 0, -1)],
    )
    for d_idx, date in enumerate(("2024-04-17", "2024-04-18")):
        date_path = tmp_path / date
        date_path.mkdir()
        for n_idx in range(2):
            (date_path / f"#{d_idx * 2 + n_idx}_name_time").mkdir()

    result = node_utils.find_n_latest_nodes_ids(tmp_path, requested_count)
    assert isinstance(result, Generator)
    assert list(result) == [4 - i for i in range(min(requested_count, 4))]
