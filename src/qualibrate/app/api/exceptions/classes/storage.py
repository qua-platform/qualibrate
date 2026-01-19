from qualibrate_app.api.exceptions.classes.base import QualibrateException


class QPathException(QualibrateException, OSError):
    pass


class QFileNotFoundException(QPathException, FileNotFoundError):
    pass


class QRelativeNotSubpathException(QPathException):
    pass


class QNotADirectoryException(QPathException, NotADirectoryError):
    pass
