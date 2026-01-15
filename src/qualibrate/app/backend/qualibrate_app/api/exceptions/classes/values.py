from qualibrate_app.api.exceptions.classes.base import QualibrateException


class QValueException(QualibrateException, ValueError):
    pass
