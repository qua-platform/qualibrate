from itertools import chain

from .base_loader import BaseLoader
from .image_loader import ImageLoader
from .json_loader import JSONLoader
from .numpy_array_loader import NumpyArrayLoader
from .quam_loader import QuamLoader
from .xarray_loader import XarrayLoader

__all__ = [
    "QuamLoader",
    "BaseLoader",
    "JSONLoader",
    "NumpyArrayLoader",
    "ImageLoader",
    "XarrayLoader",
    "DEFAULT_LOADERS",
    "SUPPORTED_EXTENSIONS",
]


DEFAULT_LOADERS = [
    QuamLoader,
    JSONLoader,
    NumpyArrayLoader,
    ImageLoader,
    XarrayLoader,
]

SUPPORTED_EXTENSIONS = set(
    chain.from_iterable(loader.file_extensions for loader in DEFAULT_LOADERS)
)
