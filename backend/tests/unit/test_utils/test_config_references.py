from unittest.mock import call

import pytest

from qualibrate.utils import config_references as cr


@pytest.fixture
def config_with_refs():
    return {
        "qual": {"project": "my_project"},
        "data_handler": {
            "root": "/data/${#/data_handler/project}/subpath",
            "project": "${#/qual/project}",
        },
        "sub": {
            "item": {
                "path": "path_${#/data_handler/root}_project_${#/qual/project}"
            }
        },
    }


@pytest.fixture
def path_with_refs():
    return {
        "/data_handler/root": cr.PathWithSolvingReferences(
            config_path="/data_handler/root",
            value=None,
            solved=False,
            references=[
                cr.Reference(
                    config_path="/data_handler/root",
                    reference_path="/data_handler/project",
                    index_start=6,
                    index_end=30,
                    value=None,
                    solved=False,
                )
            ],
        ),
        "/data_handler/project": cr.PathWithSolvingReferences(
            config_path="/data_handler/project",
            value=None,
            solved=False,
            references=[
                cr.Reference(
                    config_path="/data_handler/project",
                    reference_path="/qual/project",
                    index_start=0,
                    index_end=16,
                    value=None,
                    solved=False,
                )
            ],
        ),
        "/sub/item/path": cr.PathWithSolvingReferences(
            config_path="/sub/item/path",
            value=None,
            solved=False,
            references=[
                cr.Reference(
                    config_path="/sub/item/path",
                    reference_path="/data_handler/root",
                    index_start=5,
                    index_end=26,
                    value=None,
                    solved=False,
                ),
                cr.Reference(
                    config_path="/sub/item/path",
                    reference_path="/qual/project",
                    index_start=36,
                    index_end=52,
                    value=None,
                    solved=False,
                ),
            ],
        ),
    }


def test_find_all_references_mapping_item(mocker):
    find_ref_spy = mocker.spy(cr, "find_all_references")
    assert cr.find_all_references({"key": {"a": 1}}) == []
    assert find_ref_spy.call_count == 2

    find_ref_spy.assert_has_calls(
        (call({"key": {"a": 1}}), call({"a": 1}, ["key"]))
    )


def test_find_all_references_string_single_ref(mocker):
    find_ref_spy = mocker.spy(cr, "find_all_references")
    expected_ref = cr.Reference(
        config_path="/key",
        reference_path="/ref",
        index_start=0,
        index_end=7,
        value=None,
        solved=False,
    )
    assert cr.find_all_references({"key": "${#/ref}"}) == [expected_ref]
    assert find_ref_spy.call_count == 1


def test_find_all_references_string_multi_ref(mocker):
    find_ref_spy = mocker.spy(cr, "find_all_references")
    assert cr.find_all_references({"key": "${#/ref}_${#/other}"}) == [
        cr.Reference(
            config_path="/key",
            reference_path="/ref",
            index_start=0,
            index_end=7,
            value=None,
            solved=False,
        ),
        cr.Reference(
            config_path="/key",
            reference_path="/other",
            index_start=9,
            index_end=18,
            value=None,
            solved=False,
        ),
    ]
    assert find_ref_spy.call_count == 1


def test_find_all_references_string_no_ref(mocker):
    find_ref_spy = mocker.spy(cr, "find_all_references")
    assert cr.find_all_references({"k1": 1, "k2": "$#/aa", "k3": "value"}) == []
    assert find_ref_spy.call_count == 1


def test_find_all_references_complex(config_with_refs):
    assert cr.find_all_references(config_with_refs) == [
        cr.Reference(
            config_path="/data_handler/root",
            reference_path="/data_handler/project",
            index_start=6,
            index_end=30,
            value=None,
            solved=False,
        ),
        cr.Reference(
            config_path="/data_handler/project",
            reference_path="/qual/project",
            index_start=0,
            index_end=16,
            value=None,
            solved=False,
        ),
        cr.Reference(
            config_path="/sub/item/path",
            reference_path="/data_handler/root",
            index_start=5,
            index_end=26,
            value=None,
            solved=False,
        ),
        cr.Reference(
            config_path="/sub/item/path",
            reference_path="/qual/project",
            index_start=36,
            index_end=52,
            value=None,
            solved=False,
        ),
    ]


def test_check_cycles_in_references_exists():
    assert cr.check_cycles_in_references(
        {"a": ("b", "c"), "b": ("c", "d"), "c": ("a",)}
    )


def test_check_cycles_in_references_not_exists():
    assert not cr.check_cycles_in_references(
        {"a": ("b", "d"), "b": ("c", "e"), "c": ("d",)}
    )


def test__resolve_references_no_subref(config_with_refs, path_with_refs):
    solved_references = {}
    assert (
        cr._resolve_references(
            "/data_handler/project",
            path_with_refs,
            config_with_refs,
            solved_references,
        )
        is None
    )
    assert solved_references == {
        "/qual/project": "my_project",
        "/data_handler/project": "my_project",
    }
    config_item = path_with_refs["/data_handler/project"]
    assert config_item.solved
    assert config_item.value == "my_project"
    assert config_item.references == [
        cr.Reference(
            config_path="/data_handler/project",
            reference_path="/qual/project",
            index_start=0,
            index_end=16,
            value="my_project",
            solved=True,
        )
    ]


def test__resolve_references_with_subref(config_with_refs, path_with_refs):
    solved_references = {}
    assert (
        cr._resolve_references(
            "/sub/item/path",
            path_with_refs,
            config_with_refs,
            solved_references,
        )
        is None
    )
    assert solved_references == {
        "/qual/project": "my_project",
        "/data_handler/project": "my_project",
        "/data_handler/root": "/data/my_project/subpath",
        "/sub/item/path": "path_/data/my_project/subpath_project_my_project",
    }
    assert path_with_refs == {
        "/data_handler/root": cr.PathWithSolvingReferences(
            config_path="/data_handler/root",
            value="/data/my_project/subpath",
            solved=True,
            references=[
                cr.Reference(
                    config_path="/data_handler/root",
                    reference_path="/data_handler/project",
                    index_start=6,
                    index_end=30,
                    value="my_project",
                    solved=True,
                )
            ],
        ),
        "/data_handler/project": cr.PathWithSolvingReferences(
            config_path="/data_handler/project",
            value="my_project",
            solved=True,
            references=[
                cr.Reference(
                    config_path="/data_handler/project",
                    reference_path="/qual/project",
                    index_start=0,
                    index_end=16,
                    value="my_project",
                    solved=True,
                )
            ],
        ),
        "/sub/item/path": cr.PathWithSolvingReferences(
            config_path="/sub/item/path",
            value="path_/data/my_project/subpath_project_my_project",
            solved=True,
            references=[
                cr.Reference(
                    config_path="/sub/item/path",
                    reference_path="/data_handler/root",
                    index_start=5,
                    index_end=26,
                    value="/data/my_project/subpath",
                    solved=True,
                ),
                cr.Reference(
                    config_path="/sub/item/path",
                    reference_path="/qual/project",
                    index_start=36,
                    index_end=52,
                    value="my_project",
                    solved=True,
                ),
            ],
        ),
    }


def test_resolve_references_with_cycle(mocker):
    mocker.patch(
        "qualibrate.utils.config_references.find_all_references",
    )
    mocker.patch(
        "qualibrate.utils.config_references.check_cycles_in_references",
        return_value=True,
    )
    with pytest.raises(ValueError) as ex:
        cr.resolve_references({"a": "${#/b}", "b": "${#/a}"})
    assert ex.type == ValueError
    assert ex.value.args == ("Config contains cycles",)


def test_resolve_references_full_no_subref():
    doc = {"a": "b", "c": {"d": 2}}
    assert cr.resolve_references(doc) == doc


def test_resolve_references_full_with_subref(config_with_refs):
    assert cr.resolve_references(config_with_refs) == {
        "qual": {"project": "my_project"},
        "data_handler": {
            "root": "/data/my_project/subpath",
            "project": "my_project",
        },
        "sub": {
            "item": {"path": "path_/data/my_project/subpath_project_my_project"}
        },
    }
