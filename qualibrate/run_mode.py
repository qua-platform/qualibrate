from pydantic import BaseModel


class RunModes(BaseModel):
    inspection: bool = False
    interactive: bool = False
    external: bool = True
