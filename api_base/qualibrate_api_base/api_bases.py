from abc import ABC, abstractmethod
from typing import Mapping, Any, Sequence, Union, Optional

DocumentType = Mapping[str, Any]
DocumentsSequence = Sequence[DocumentType]


class Root(ABC):
    @abstractmethod
    def get_base_collection(self) -> "Root":
        pass


class ApiBase(ABC):
    pass


class Snapshot(ApiBase, ABC):
    @abstractmethod
    def get(self, id: Union[int, str]) -> Optional[DocumentType]:
        pass

    @abstractmethod
    def search_data_values(
        self,
        id: Union[int, str],
        data_path: list[Union[str, int]],
    ) -> DocumentsSequence:
        pass

    @abstractmethod
    def search_data_values_any_depth(
        self, id: Union[int, str], target_key: str,
    ) -> DocumentsSequence:
        pass

    @abstractmethod
    def get_history(self, id: Union[int, str]) -> DocumentsSequence:
        pass


class Branch(ApiBase, Root, ABC):
    @abstractmethod
    def get_last_snapshot(self, branch_name: str) -> DocumentType:
        pass

    @abstractmethod
    def search_data_values(
        self, branch_name: str,
        data_path: list[Union[str, int]],
        snapshot_api: Snapshot,
    ) -> DocumentsSequence:
        pass

    @abstractmethod
    def get_history(
        self, branch_name: str, snapshot_api: Snapshot
    ) -> DocumentsSequence:
        pass


class BranchGroup(ApiBase, Root, ABC):
    @abstractmethod
    def all(self) -> DocumentsSequence:
        pass

    @abstractmethod
    def names(self) -> Sequence[str]:
        pass


