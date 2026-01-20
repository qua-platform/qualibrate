from qualibrate.app.api.exceptions.classes.base import QualibrateException


class QApiException(QualibrateException, ConnectionError):
    pass
