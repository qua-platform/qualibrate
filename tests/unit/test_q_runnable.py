from qualibrate.parameters import NodeParameters
from qualibrate.q_runnnable import QRunnable


class Parameters(NodeParameters):
    resonator: str
    sampling_points: int = 100
    noise_factor: float = 0.1
    wait_time: float = 4
    list_values: list[int] = [1, 2, 3]  # allowed because pydantic use copy

    def instance_method(self):
        pass

    @classmethod
    def class_method(cls):
        pass

    @staticmethod
    def static_method():
        pass


def validate_fields(original_instance, built_class):
    resonator_field = built_class.model_fields["resonator"]
    assert (
        resonator_field.annotation
        == Parameters.model_fields["resonator"].annotation
    )
    assert resonator_field.is_required() is False
    assert resonator_field.default == "resonator"
    for field_name in original_instance.model_fields_set - {"resonator"}:
        assert (
            original_instance.model_fields[field_name]
            == built_class.model_fields[field_name]
        )


def test_build_parameters_class_from_instance_passed_as_base():
    instance = Parameters(resonator="resonator")
    parameters_class = QRunnable.build_parameters_class_from_instance(
        instance,
        use_passed_as_base=True,
    )
    assert parameters_class.__bases__ == (Parameters,)
    assert hasattr(parameters_class, "instance_method")
    assert hasattr(parameters_class, "class_method")
    assert hasattr(parameters_class, "static_method")
    validate_fields(instance, parameters_class)


def test_build_parameters_class_from_instance_copy_base():
    instance = Parameters(resonator="resonator")
    parameters_class = QRunnable.build_parameters_class_from_instance(instance)
    assert parameters_class.__bases__ == Parameters.__bases__
    assert not hasattr(parameters_class, "instance_method")
    assert not hasattr(parameters_class, "class_method")
    assert not hasattr(parameters_class, "static_method")
    validate_fields(instance, parameters_class)
