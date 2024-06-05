import uvicorn
from fastapi import FastAPI

from qualibrate_runner.api.routes import base_router

app = FastAPI()
app.include_router(base_router)


def main(port: int, reload: bool) -> None:
    uvicorn.run("qualibrate_runner.app:app", port=port, reload=reload)


if __name__ == "__main__":
    main(port=8002, reload=False)
