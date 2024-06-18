from typing import Any, Mapping, cast

from pydantic import BaseModel


class NodeParameters(BaseModel):
    @classmethod
    def serialize(cls) -> Mapping[str, Any]:
        return cast(Mapping[str, Any], cls.model_json_schema()["properties"])
