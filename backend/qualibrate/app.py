import uvicorn
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from starlette.middleware.cors import CORSMiddleware

from qualibrate.api.__main__ import api_router
from qualibrate.config import get_settings

app = FastAPI(title="Qualibrate")

origins = ["http://localhost:8002", "http://localhost:8001"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api/json_db")

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
