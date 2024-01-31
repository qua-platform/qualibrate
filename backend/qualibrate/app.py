from pathlib import Path

import uvicorn
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles

from qualibrate.api.__main__ import api_router


app = FastAPI()

app.include_router(api_router)

static_dir = Path(__file__).parents[2] / "static"

if static_dir.is_dir():
    app.mount("/", StaticFiles(directory=static_dir, html=True), name="static")


if __name__ == "__main__":
    uvicorn.run("app:app", reload=True)
