from qualibrate.app.api.exceptions.classes.base import QualibrateException


class QTypeException(QualibrateException, TypeError):
    pass


class QInvalidIdTypeException(QTypeException):
    pass
