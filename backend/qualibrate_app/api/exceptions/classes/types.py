from qualibrate.api.exceptions.classes.base import QualibrateException


class QTypeException(QualibrateException, TypeError):
    pass


class QInvalidIdTypeException(QTypeException):
    pass
