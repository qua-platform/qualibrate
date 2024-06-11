from typing import Any, Mapping

from pydantic import BaseModel


class NodeParameters(BaseModel):
    @classmethod
    def serialize(cls) -> Mapping[str, Any]:
        return cls.model_json_schema()["properties"]
