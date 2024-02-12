import pytest

from qualibrate.api.core.utils.common_utils import id_type_str


def test_id_type_str_func_arg_valid():
    def _call(*args, **kwargs):
        pass

    wrapped = id_type_str(_call)
    # first argument is method
    wrapped("str")


def test_id_type_str_method_arg_valid():
    C = type("C", (), {"call": lambda self, *args, **kwargs: None})
    obj = C()
    obj.call = id_type_str(obj.call)
    obj.call("str")


def test_id_type_str_kwarg_valid():
    def _call(*args, **kwargs):
        pass

    wrapped = id_type_str(_call)
    wrapped(id="str")


def test_id_type_str_func_arg_invalid_type():
    def _call(*args, **kwargs):
        pass

    wrapped = id_type_str(_call)
    # first argument is method
    with pytest.raises(TypeError) as ex:
        wrapped(1)
    assert ex.type is TypeError
    assert ex.value.args[0] == "id should be str"


def test_id_type_str_method_arg_invalid():
    C = type("C", (), {"call": lambda self, *args, **kwargs: None})
    obj = C()
    obj.call = id_type_str(obj.call)
    # first argument is method
    with pytest.raises(TypeError) as ex:
        obj.call(1)
    assert ex.type is TypeError
    assert ex.value.args[0] == "id should be str"


def test_id_type_str_func_kwarg_invalid():
    def _call(*args, **kwargs):
        pass

    wrapped = id_type_str(_call)
    # first argument is method
    with pytest.raises(TypeError) as ex:
        wrapped(id=1)
    assert ex.type is TypeError
    assert ex.value.args[0] == "id should be str"
