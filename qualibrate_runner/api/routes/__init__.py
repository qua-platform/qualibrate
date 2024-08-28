from fastapi import APIRouter

from .get_runnables import get_runnables_router
from .last_run import last_run_router
from .others import others_router
from .submit import submit_router

base_router = APIRouter()

base_router.include_router(submit_router)
base_router.include_router(get_runnables_router)
base_router.include_router(last_run_router)
base_router.include_router(others_router)
