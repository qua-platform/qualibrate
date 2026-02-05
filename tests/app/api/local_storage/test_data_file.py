from pathlib import Path


def test_data_file_get_node_storage(client_custom_settings, default_local_storage_project):
    response = client_custom_settings.get("/api/data_file/3/")
    assert response.status_code == 200
    assert response.json() == str(Path("2024-04-25", "#3_name_3_182700"))


def test_data_file_get_node_storage_content(client_custom_settings, default_local_storage_project):
    response = client_custom_settings.get("/api/data_file/3/content")
    assert response.status_code == 200
    assert response.json() == {"info": "out data", "result": "node_3"}
