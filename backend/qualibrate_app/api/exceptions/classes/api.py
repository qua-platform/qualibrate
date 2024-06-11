from qualibrate.api.exceptions.classes.base import QualibrateException


class QApiException(QualibrateException, ConnectionError):
    pass
