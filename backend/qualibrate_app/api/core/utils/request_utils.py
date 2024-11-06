from collections.abc import Mapping
from functools import partial
from typing import Any, Callable, Optional, Union
from urllib.parse import urljoin

import requests
from fastapi import HTTPException
from pydantic import HttpUrl

HTTPException422 = partial(HTTPException, status_code=422)


def request_with_db(
    path: str,
    *,
    params: Optional[Mapping[str, Any]] = None,
    db_name: str,
    timeout: float,
    method: Callable[..., requests.Response] = requests.get,
    host: Union[HttpUrl, str],
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
