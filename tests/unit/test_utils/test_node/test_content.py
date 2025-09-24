from collections.abc import Sequence

from qualibrate import NodeParameters
from qualibrate.utils.node import content


def test_load_parameters_without_build():
    assert (
        content.load_parameters(
            {
                "model": "model_content",
                "schema": "schema_content",
            },
            1,
            False,
        )
        == "model_content"
    )


def test_load_parameters_with_build():
    class Parameters(NodeParameters):
        resonator: str
        sampling_points: int = 100
        noise_factor: float = 0.1
        wait_time: float = 4
        list_values: list[int] = [1, 2, 3]  # allowed because pydantic use copy

    parameters = Parameters(resonator="q1")
    node_id = 1
    loaded_parameters = content.load_parameters(
        {
            "model": parameters.model_dump(),
            "schema": parameters.model_json_schema(),
        },
        node_id,
        True,
    )
    assert (
        loaded_parameters.__class__.__name__ == f"LoadedNode{node_id}Parameters"
    )
    assert parameters.model_dump() == loaded_parameters.model_dump()

    failed = {}
    expected_field_props = {
        "resonator": (str, True, None),
        "sampling_points": (int | None, False, 100),
        "noise_factor": (float | None, False, 0.1),
        "wait_time": (float | None, False, 4),
        "list_values": (Sequence[int] | None, False, [1, 2, 3]),
    }
    for field_name, props in expected_field_props.items():
        field = loaded_parameters.model_fields[field_name]
        required = field.is_required()
        if field.annotation != props[0] or props[1] is not required:
            failed.update({field_name: {"expected": props, "loaded": field}})
        if not required and props[2] != field.default:
            failed.update({field_name: {"expected": props, "loaded": field}})
    if len(failed):
        raise AssertionError(failed)
