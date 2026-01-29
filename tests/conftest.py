"""Root conftest.py - ensures src directory is in Python path for tests."""

import sys
from pathlib import Path

# Add src directory to Python path so tests can import qualibrate modules
# without requiring the package to be installed
src_path = Path(__file__).parent.parent / "src"
if str(src_path) not in sys.path:
    sys.path.insert(0, str(src_path))
