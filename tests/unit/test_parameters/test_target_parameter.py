from typing import ClassVar, Optional

import pytest
from pydantic import ValidationError

from qualibrate.parameters import TargetParameter
from qualibrate.utils.type_protocols import TargetType


class TestTargetParameter:
    class SampleTargetParameter(TargetParameter):
        targets_name: ClassVar[Optional[str]] = "test_targets"
        test_targets: Optional[list[TargetType]] = None
        other_field: Optional[str] = None

    def test_prepare_targets_with_targets_name(self):
        instance = TestTargetParameter.SampleTargetParameter(
            test_targets=["1", "2", "3"]
        )
        assert instance.targets == ["1", "2", "3"]
        assert instance.test_targets == ["1", "2", "3"]

    def test_prepare_targets_with_targets(self):
        instance = TestTargetParameter.SampleTargetParameter(
            targets=["1", "2", "3"]
        )
        assert instance.targets == ["1", "2", "3"]
        assert instance.test_targets == ["1", "2", "3"]

    def test_prepare_targets_without_targets(self):
        instance = TestTargetParameter.SampleTargetParameter(
            other_field="value"
        )
        assert instance.test_targets is None
        assert instance.targets is None
        assert instance.other_field == "value"

    def test_prepare_targets_with_both_fields(self, mocker):
        logger_mock = mocker.patch("qualibrate.parameters.logger")
        instance = TestTargetParameter.SampleTargetParameter(
            targets=["1", "2", "3"], test_targets=["4", "5", "6"]
        )
        assert instance.test_targets == ["1", "2", "3"]
        assert instance.targets == ["1", "2", "3"]
        logger_mock.warning.assert_called_once_with(
            "You specified `targets` and `test_targets` (marked as targets "
            "name) fields. `test_targets` will be ignored.",
        )

    def test_prepare_targets_without_targets_name(self):
        class NoTargetsNameParameter(TargetParameter):
            pass

        with pytest.raises(
            ValidationError, match="Targets specified without targets name"
        ):
            NoTargetsNameParameter(targets=[1, 2, 3])

    def test_targets_exists_if_specified_invalid(self):
        with pytest.raises(ValidationError):
            TestTargetParameter.SampleTargetParameter(
                test_targets="not a sequence"
            )

    def test_targets_property(self):
        instance = TestTargetParameter.SampleTargetParameter(
            test_targets=["1", "2", "3"]
        )
        assert instance.targets == ["1", "2", "3"]

    def test_targets_property_none(self):
        instance = TestTargetParameter.SampleTargetParameter()
        assert instance.targets is None

    def test_targets_setter_valid(self):
        instance = TestTargetParameter.SampleTargetParameter()
        instance.targets = [4, 5, 6]
        assert instance.test_targets == [4, 5, 6]

    def test_targets_setter_invalid(self):
        instance = TestTargetParameter.SampleTargetParameter()
        with pytest.raises(
            ValueError, match="Targets must be an iterable of <class 'str'>"
        ):
            instance.targets = 11

    def test_serialize_targets_include(self):
        parameters = {
            "test_targets": {"type": "array"},
            "other_field": {"type": "string"},
        }
        result = TestTargetParameter.SampleTargetParameter.serialize_targets(
            parameters
        )
        assert result == {
            "test_targets": {"type": "array", "is_targets": True},
            "other_field": {"type": "string", "is_targets": False},
        }

    def test_serialize_targets_exclude(self):
        parameters = {
            "test_targets": {"type": "array"},
            "other_field": {"type": "string"},
        }
        result = TestTargetParameter.SampleTargetParameter.serialize_targets(
            parameters, exclude_targets=True
        )
        assert result == {
            "other_field": {"type": "string", "is_targets": False}
        }
