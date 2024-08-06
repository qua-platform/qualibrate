from pydantic import BaseModel


class RunMode(BaseModel):
    inspection: bool = False
    interactive: bool = False
    external: bool = True
