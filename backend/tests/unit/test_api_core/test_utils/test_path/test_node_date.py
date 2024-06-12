from datetime import datetime
from unittest.mock import PropertyMock

from qualibrate_app.api.core.utils.path.node_date import NodesDatePath


class TestNodesDatePath:
    def test_date(self, mocker):
        node_date = NodesDatePath("/path/2024-04-27")
        dt = datetime(2024, 4, 27, 0, 0, 0)
        mocker.patch.object(
            node_date, "datetime", new_callable=PropertyMock, return_value=dt
        )

    def test_datetime(self):
        node_date = NodesDatePath("/path/2024-04-27")
        assert node_date.datetime == datetime(2024, 4, 27, 0, 0, 0)
