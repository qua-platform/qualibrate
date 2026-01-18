import uvicorn
from fastapi import FastAPI

from qualibrate_runner.api.middleware.process_time import ProcessTimeMiddleware
from qualibrate_runner.api.routes import base_router
from qualibrate_runner.api.sockets import base_ws_router
from qualibrate_runner.core.app.lifespan import app_lifespan

app = FastAPI(lifespan=app_lifespan)
app.add_middleware(ProcessTimeMiddleware)
app.include_router(base_router)
app.include_router(base_ws_router)


def main(port: int, reload: bool) -> None:
    uvicorn.run("qualibrate_runner.app:app", port=port, reload=reload)


if __name__ == "__main__":
    main(port=8002, reload=False)
