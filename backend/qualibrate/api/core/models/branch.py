from qualibrate.api.core.models.base import ModelWithIdCreatedAt


class Branch(ModelWithIdCreatedAt):
    name: str
    snapshot_id: int
