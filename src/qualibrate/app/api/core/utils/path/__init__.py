import sys
from pathlib import PosixPath, WindowsPath

if sys.platform == "win32" or sys.platform == "cygwin":
    ConcretePath = WindowsPath
else:
    ConcretePath = PosixPath


# TODO: add class for project root
#   contains: iterdir that filters only date dir
