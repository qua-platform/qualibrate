from collections.abc import Callable, Mapping
from functools import partial
from typing import Any
from urllib.parse import urljoin

import requests
from fastapi import HTTPException
from pydantic import HttpUrl
from qualibrate_config.models import (
    QualibrateConfig,
    QualibrateRunnerRemoteServiceConfig,
)

HTTPException422 = partial(HTTPException, status_code=422)


def get_runner_config(
    config: QualibrateConfig,
) -> QualibrateRunnerRemoteServiceConfig:
    if config.runner is None:
        raise RuntimeError("Qualibrate runner remote service is not configured")
    return config.runner


def request_with_db(
    path: str,
    *,
    params: Mapping[str, Any] | None = None,
    db_name: str,
    timeout: float,
    method: Callable[..., requests.Response] = requests.get,
    host: HttpUrl | str,
    **kwargs: Any,
) -> requests.Response:
    if params is None:
        params = {"db_name": db_name}
    else:
        params = dict(params)
        params["db_name"] = db_name
    result = method(
        urljoin(str(host), path),
        params=params,
        timeout=timeout,
        **kwargs,
    )
    return result
