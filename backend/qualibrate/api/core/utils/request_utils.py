from functools import partial
from typing import Any, Callable, Mapping, Optional
from urllib.parse import urljoin

import requests
from fastapi import HTTPException

from qualibrate.config import get_settings

HTTPException422 = partial(HTTPException, status_code=422)


def get_with_db(
    path: str,
    *,
    params: Optional[Mapping[str, Any]] = None,
    db_name: Optional[str] = None,
    timeout: Optional[float] = None,
    method: Callable[..., requests.Response] = requests.get,
    host: Optional[str] = None,
    **kwargs: Any,
) -> requests.Response:
    settings = get_settings()
    host = host or str(settings.timeline_db.address)
    db_name = db_name if db_name is not None else settings.project
    timeout = timeout if timeout is not None else settings.timeline_db.timeout
    if params is None:
        params = {"db_name": db_name}
    else:
        params = dict(params)
        params["db_name"] = db_name
    result = method(
        urljoin(host, path),
        params=params,
        timeout=timeout,
        **kwargs,
    )
    return result
