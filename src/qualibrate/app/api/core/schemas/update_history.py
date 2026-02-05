from pydantic import BaseModel, computed_field

from qualibrate.app.api.core.types import IdType


class UpdateHistoryRequired(BaseModel):
    saved_id: IdType | None
    latest_id: IdType | None

    @computed_field
    def update_required(self) -> bool:
        return self.latest_id != self.saved_id
