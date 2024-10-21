from typing import Type

import pytest
from pydantic import Field

from qualibrate.parameters import NodeParameters
from qualibrate.qualibration_node import QualibrationNode


@pytest.fixture
def params_with_req() -> Type[NodeParameters]:
    class Parameters(NodeParameters):
        qubits: list[str] = Field(default_factory=list)
        req_str_param: str
        int_param: int = 1
        float_param: float = 2.0

    yield Parameters


@pytest.fixture
def node_with_req_param(
    params_with_req: Type[NodeParameters],
) -> QualibrationNode:
    yield QualibrationNode(
        "node_name", params_with_req(req_str_param="a"), "node description"
    )


def test_copy_without_parameters_changes(node_with_req_param: QualibrationNode):
    node = node_with_req_param
    copied = node.copy()
    assert node is not copied
    assert copied.name == node.name
    assert node.parameters_class is not copied.parameters_class
    assert (
        node.parameters_class.serialize() == copied.parameters_class.serialize()
    )


def test_copy_without_parameters_instance(
    node_with_req_param: QualibrationNode,
):
    node = node_with_req_param
    copied = node.copy("new_name", req_str_param="param", float_param=-1.2)
    assert node is not copied
    assert copied.name == "new_name"
    assert node.parameters_class is not copied.parameters_class
    assert (
        copied.parameters_class.model_fields["req_str_param"].default == "param"
    )
    assert copied.parameters_class.model_fields["int_param"].default == 1
    assert copied.parameters_class.model_fields["float_param"].default == -1.2


def test_copy_with_parameters_instance(
    params_with_req: Type[NodeParameters], node_with_req_param: QualibrationNode
):
    node = node_with_req_param
    node.modes.external = False
    node.parameters = node_with_req_param.parameters_class(
        req_str_param="aaa", int_param=10
    )
    assert node.parameters == node_with_req_param.parameters_class(
        req_str_param="aaa", int_param=10, float_param=2.0
    )
    copied = node.copy(req_str_param="param", float_param=-1.2)
    assert node is not copied
    assert node.parameters_class is not copied.parameters_class
    assert (
        copied.parameters_class.model_fields["req_str_param"].default == "param"
    )
    assert copied.parameters_class.model_fields["int_param"].default == 1
    assert copied.parameters_class.model_fields["float_param"].default == -1.2
    assert (
        copied.parameters.model_dump()
        == copied.parameters_class(
            req_str_param="param", int_param=1, float_param=-1.2
        ).model_dump()
    )
