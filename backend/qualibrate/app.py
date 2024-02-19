import uvicorn
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles

from qualibrate.api.__main__ import api_router
from qualibrate.config import get_settings

app = FastAPI(title="Qualibrate")

app.include_router(api_router, prefix="/api/local")

# Directory should exist
app.mount(
    "/",
    StaticFiles(directory=get_settings().static_site_files, html=True),
    name="static",
)


def main(port: int, reload: bool) -> None:
    uvicorn.run("qualibrate.app:app", port=port, reload=reload)


if __name__ == "__main__":
    main(port=8000, reload=False)
