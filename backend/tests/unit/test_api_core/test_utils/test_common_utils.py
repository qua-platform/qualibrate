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


def test_id_type_str_method_arg_invalid():
    class C:
        @id_type_str
        def call(self, *args, **kwargs):
            pass

    with pytest.raises(TypeError) as ex:
        C().call(1)
    assert ex.type is TypeError
    assert ex.value.args[0] == "id should be str"
