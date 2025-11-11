from collections.abc import Generator
from pathlib import Path

from pydantic import Field
from pytest import fixture

from qualibrate import GraphParameters, QualibrationLibrary


@fixture
def qualibration_lib() -> Generator[QualibrationLibrary, None, None]:
    cal_path = Path(__file__).parent / "calibrations"
    tmp = QualibrationLibrary(cal_path)
    yield tmp


@fixture
def graph_params() -> GraphParameters:
    class GP(GraphParameters):
        qubits: list[str] = Field(default_factory=list)
        retries: int = 2

    return GP(retries=1)
