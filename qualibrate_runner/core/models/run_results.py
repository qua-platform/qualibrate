"""These models based on RunSummary of qualibrate-core but exclude duplications
of RunStatus fields"""

from collections.abc import Mapping
from typing import Any

from pydantic import BaseModel, ConfigDict, Field
from qualibrate.models.outcome import Outcome
from qualibrate.utils.type_protocols import TargetType

from qualibrate_runner.core.models.common import RunError


class RunResults(BaseModel):
    model_config = ConfigDict(extra="ignore")

    parameters: dict[str, Any]
    outcomes: dict[TargetType, Outcome]
    error: RunError | None = None

    initial_targets: list[TargetType] = Field(default_factory=list)
    successful_targets: list[TargetType] = Field(default_factory=list)
    failed_targets: list[TargetType] = Field(default_factory=list)
    state_updates: Mapping[str, Any] = Field(default_factory=dict)
