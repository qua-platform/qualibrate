from pathlib import Path

from qualibrate.api.core.domain.local_storage.utils import filters


def test_date_less_or_eq():
    assert filters.date_less_or_eq(Path("2024-04-04"), "2024-04-04") is True
    assert filters.date_less_or_eq(Path("2024-04-03"), "2024-04-04") is True
    assert filters.date_less_or_eq(Path("2024-03-04"), "2024-04-04") is True
    assert filters.date_less_or_eq(Path("2023-04-04"), "2024-04-04") is True

    assert filters.date_less_or_eq(Path("2024-04-04"), "2024-04-03") is False
    assert filters.date_less_or_eq(Path("2024-04-04"), "2024-03-04") is False
    assert filters.date_less_or_eq(Path("2024-04-04"), "2023-04-04") is False


def test_id_less_then_snapshot(mocker):
    id_extract_patched = mocker.patch(
        "qualibrate.api.core.domain.local_storage.utils.filters.get_node_id_name_time",
        return_value=(3, None, None),
    )
    filename = Path("#3_name")
    assert filters.id_less_then_snapshot(filename, 4) is True
    assert filters.id_less_then_snapshot(filename, 3) is False
    assert filters.id_less_then_snapshot(filename, 2) is False
    id_extract_patched.assert_has_calls([mocker.call(filename)] * 3)
