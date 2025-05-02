import json

import jsonpointer
import pytest


def test_snapshot_get_snapshot_default(
    client_custom_settings, default_local_storage_project, snapshots_history
):
    snapshot_id = 4
    response = client_custom_settings.get(f"/api/snapshot/{snapshot_id}/")
    snapshot = snapshots_history[len(snapshots_history) - snapshot_id]
    snapshot.update(
        {
            "data": {
                "quam": {
                    "quam": {"node": snapshot_id},
                    "info": "snapshot",
                },
                "parameters": None,
                "outcomes": None,
            },
        }
    )
    assert response.status_code == 200
    assert response.json() == snapshot


@pytest.mark.parametrize(
    "load_type, to_update",
    (
        (
            1,
            {
                "metadata": {
                    "description": None,
                    "run_end": None,
                    "run_start": None,
                    "run_duration": None,
                    "status": None,
                },
                "data": None,
            },
        ),
        (
            2,
            {
                "data": None,
            },
        ),
        (
            3,
            {
                "data": {
                    "quam": {"quam": {"node": 4}, "info": "snapshot"},
                    "parameters": None,
                    "outcomes": None,
                }
            },
        ),
        (
            4,
            {
                "data": {
                    "quam": {"quam": {"node": 4}, "info": "snapshot"},
                    "parameters": None,
                    "outcomes": None,
                }
            },
        ),
    ),
)
def test_snapshot_get_snapshot_load_type(
    client_custom_settings,
    default_local_storage_project,
    snapshots_history,
    load_type,
    to_update,
):
    snapshot_id = 4
    response = client_custom_settings.get(
        f"/api/snapshot/{snapshot_id}/",
        params={"load_type": load_type},
    )
    snapshot = snapshots_history[len(snapshots_history) - snapshot_id]
    snapshot.update(to_update)
    assert response.status_code == 200
    assert response.json() == snapshot


@pytest.mark.parametrize("snapshot_id", [9, 4, 1])
def test_snapshot_history_default(
    client_custom_settings, snapshots_history, snapshot_id
):
    response = client_custom_settings.get(
        f"/api/snapshot/{snapshot_id}/history"
    )
    assert response.status_code == 200
    assert response.json() == {
        "page": 1,
        "per_page": 50,
        "total_items": 9,
        "total_pages": 1,
        "items": snapshots_history[len(snapshots_history) - snapshot_id :],
    }


def test_snapshots_compare_by_id(client_custom_settings, snapshots_history):
    response = client_custom_settings.get(
        "/api/snapshot/3/compare", params={"id_to_compare": 5}
    )
    assert response.status_code == 200
    assert response.json() == {"/quam/node": {"old": 3, "new": 5}}

    response = client_custom_settings.get(
        "/api/snapshot/5/compare", params={"id_to_compare": 3}
    )
    assert response.status_code == 200
    assert response.json() == {"/quam/node": {"old": 5, "new": 3}}


@pytest.mark.parametrize(
    "s_id, data_path, result",
    (
        (3, "quam", [{"key": ["quam"], "value": {"node": 3}}]),
        (3, "quam.node", [{"key": ["quam", "node"], "value": 3}]),
        (6, "quam", [{"key": ["quam"], "value": {"node": 6}}]),
        (6, "quam.node", [{"key": ["quam", "node"], "value": 6}]),
    ),
)
def test_snapshots_search_data(client_custom_settings, s_id, data_path, result):
    response = client_custom_settings.get(
        f"/api/snapshot/{s_id}/search/data/values",
        params={"data_path": data_path},
    )
    assert response.status_code == 200
    assert response.json() == result


@pytest.mark.parametrize(
    "s_id, data_path, result",
    (
        (3, "quam.*", [{"key": ["quam", "node"], "value": 3}]),
        (3, "*.node", [{"key": ["quam", "node"], "value": 3}]),
    ),
)
def test_snapshots_search_data_wildcard(
    client_custom_settings, s_id, data_path, result
):
    response = client_custom_settings.get(
        f"/api/snapshot/{s_id}/search/data/values",
        params={"data_path": data_path},
    )
    assert response.status_code == 200
    assert response.json() == result


@pytest.mark.parametrize(
    "s_id, target_key, result",
    (
        (3, "quam", [{"path": ["quam"], "value": {"node": 3}}]),
        (3, "node", [{"path": ["quam", "node"], "value": 3}]),
        (6, "quam", [{"path": ["quam"], "value": {"node": 6}}]),
        (6, "node", [{"path": ["quam", "node"], "value": 6}]),
    ),
)
def test_snapshots_search_recursive_data(
    client_custom_settings, s_id, target_key, result
):
    response = client_custom_settings.get(
        f"/api/snapshot/{s_id}/search/data/value/any_depth",
        params={"target_key": target_key},
    )
    assert response.status_code == 200
    assert response.json() == result


def test_snapshot_update_entries(
    client_custom_settings, default_local_storage_project, mocker, tmp_path
):
    quam_state_data = {
        "octaves": {
            "oct1": {
                "name": "oct1",
                "ip": "0.0.0.0",
                "port": 9999,
                "RF_outputs": {
                    "1": {
                        "id": 1,
                        "channel": "#/qubits/qubitC1/resonator",
                        "LO_frequency": 7000000000,
                    }
                },
            }
        },
        "qubits": {
            "qubitC1": {
                "id": "qubitC1",
                "xy": {"intermediate_frequency": 168000000.0},
            }
        },
        "ports": {
            "analog_outputs": {
                "con1": {
                    "1": {
                        "controller_id": "con1",
                        "__class__": "quam.AnalogOutputPort",
                    },
                }
            }
        },
        "__class__": "quam_libs.Machine",
    }
    quam_wiring_data = {
        "wiring": {
            "qubits": {
                "qubitC1": {
                    "xy": {
                        "opx_output_I": "#/ports/analog_outputs/con1/1",
                        "opx_output_Q": "#/ports/analog_outputs/con1/1",
                        "frequency_converter_up": "#/octaves/oct1/RF_outputs/1",
                    },
                }
            }
        },
        "network": {"cloud": False},
    }
    quam_state_path = tmp_path / "quam_state_path"
    quam_state_path.mkdir()
    mocker.patch(
        (
            "qualibrate_app.api.core.domain.local_storage.utils"
            ".snapshot_content.get_quam_state_path"
        ),
        return_value=quam_state_path,
    )
    node_dir = default_local_storage_project / "2024-04-25" / "#3_name_3_182700"
    state_dir = node_dir / "quam_state"
    state_dir.mkdir()
    snapshot_file = node_dir / "state.json"
    state_file = state_dir / "state.json"
    wiring_file = state_dir / "wiring.json"
    common_state = {**quam_state_data, **quam_wiring_data}
    snapshot_file.write_text(json.dumps(common_state))
    state_file.write_text(json.dumps(quam_state_data))
    wiring_file.write_text(json.dumps(quam_wiring_data))

    updates = [
        (
            "/octaves/oct1/RF_outputs/1/LO_frequency",
            7000000000,
            7500000000,
            state_file,
        ),
        (
            "/qubits/qubitC1/xy/intermediate_frequency",
            168000000.0,
            168500000.0,
            state_file,
        ),
        (
            "/wiring/qubits/qubitC1/xy/opx_output_I",
            "#/ports/analog_outputs/con1/1",
            "#/ports/analog_outputs/con2/1",
            wiring_file,
        ),
    ]
    for update in updates:
        assert jsonpointer.resolve_pointer(common_state, update[0]) == update[1]
    response = client_custom_settings.post(
        "/api/snapshot/3/update_entries",
        json={
            "items": [
                {"data_path": f"#{item[0]}", "value": item[2]}
                for item in updates
            ]
        },
    )
    assert response.status_code == 200
    new_snapshot_data = json.loads(snapshot_file.read_text())
    for update in updates:
        new_specific_data = json.loads(update[3].read_text())
        assert (
            jsonpointer.resolve_pointer(new_specific_data, update[0])
            == update[2]
        )
        assert (
            jsonpointer.resolve_pointer(new_snapshot_data, update[0])
            == update[2]
        )
