# %% Preamble
import requests
import json
import time

BASE_URL = "http://localhost:8001/api"


def execute_request(endpoint, params=None, title="", description=""):
    """Helper: Prints request details, executes it with timing, and displays formatted results."""
    print(f"\n{'=' * 10} {title} {'=' * 10}")
    print(description.strip())
    print(f"\nRequest: GET {BASE_URL}{endpoint}")
    if params:
        print(f"Params: {json.dumps(params, indent=2)}")

    try:
        start_time = time.time()
        response = requests.get(f"{BASE_URL}{endpoint}", params=params)
        end_time = time.time()
        duration_ms = (end_time - start_time) * 1000

        response.raise_for_status()
        data = response.json()

        # Normalize for display (handle list vs dict vs paginated dict)
        if isinstance(data, dict) and "items" in data:
            items = data["items"]
        elif isinstance(data, list):
            items = data
        else:
            items = [data]

        print(
            f"\nStatus: {response.status_code} OK | Time: {duration_ms:.2f}ms | Results: {len(items)}"
        )
        print(json.dumps(items[:3], indent=2))
        if len(items) > 3:
            print(f"... and {len(items) - 3} more items.")

        return data
    except Exception as e:
        print(f"FAILED: {e}")
        return None


def get_example_snapshot_id():
    """Helper to find a snapshot ID for use in other tests."""
    resp = requests.get(f"{BASE_URL}/root/snapshots/filter", params={"per_page": 1})
    try:
        items = resp.json().get("items", [])
        return items[0]["id"] if items else None
    except:
        return None


# %% Test 1: Filter Snapshots
def test_filter_snapshots():
    execute_request(
        "/root/snapshots/filter",
        params={
            "name_part": "Resonator_Spectroscopy",
            "descending": True,
            "per_page": 5,
        },
        title="Filter Snapshots (Metadata)",
        description="""
This test searches for snapshots that have 'Resonator_Spectroscopy' in their name.
It requests the 5 most recent snapshots (descending=True).
Expected Output: A list of 5 snapshot objects containing metadata (ID, name, creation date).
        """,
    )


test_filter_snapshots()


# %% Test 2: Single Snapshot Data Search
def test_single_snapshot_search():
    snapshot_id = get_example_snapshot_id()
    if not snapshot_id:
        return

    execute_request(
        "/root/snapshot/search",
        params={
            "id": snapshot_id,
            "data_path": "qubits.q6_10.xy.operations.x180_DragCosine.amplitude",
        },
        title="Search Single Snapshot Data",
        description=f"""
This test searches for a specific data value (amplitude of x180_DragCosine) within Snapshot ID {snapshot_id}.
It targets an exact path in the JSON structure.
Expected Output: A single result object containing the key (path) and the specific value found.
        """,
    )


test_single_snapshot_search()


# %% Test 3: Cross-Snapshot History Search
def test_history_search():
    execute_request(
        "/root/snapshots/search",
        params={
            "data_path": "qubits.q6_10.xy.operations.x180_DragCosine.amplitude",
            "filter_no_change": True,
            "per_page": 5,
        },
        title="Search History (Cross-Snapshot)",
        description="""
This test tracks the history of the 'amplitude' parameter across all snapshots.
By setting 'filter_no_change=True', it only returns entries where the value actually changed.
Expected Output: A list of results showing the value and the snapshot ID where each change occurred.
        """,
    )


test_history_search()


# %% Test 4: Recursive Search
def test_recursive_search():
    snapshot_id = get_example_snapshot_id()
    if not snapshot_id:
        return

    execute_request(
        f"/snapshot/{snapshot_id}/search/data/value/any_depth",
        params={"target_key": "amplitude"},
        title="Recursive Deep Search",
        description=f"""
This test performs a deep recursive search for the key 'amplitude' anywhere in Snapshot ID {snapshot_id}.
It does not require knowing the full path, just the key name.
Expected Output: A list of all occurrences of 'amplitude' found at any depth in the JSON structure.
        """,
    )


test_recursive_search()


# %% Test 5: Wildcard Search
def test_wildcard_search():
    snapshot_id = get_example_snapshot_id()
    if not snapshot_id:
        return

    execute_request(
        "/root/snapshot/search",
        params={"id": snapshot_id, "data_path": "qubits.q6_10.xy.operations.*.length"},
        title="Wildcard Search (*)",
        description=f"""
This test uses the wildcard '*' to match any operation in the 'operations' dictionary.
It attempts to retrieve the 'length' parameter for ALL operations in Snapshot ID {snapshot_id}.
Expected Output: A list of results, one for each operation that has a 'length' property.
        """,
    )


test_wildcard_search()


# %% Test 6: Wildcard Search (Array Index / Collection)
def test_wildcard_array_search():
    snapshot_id = get_example_snapshot_id()
    if not snapshot_id:
        return

    execute_request(
        "/root/snapshot/search",
        params={"id": snapshot_id, "data_path": "qubits.*.id"},
        title="Wildcard Search (All Qubits IDs)",
        description=f"""
This test uses the wildcard '*' to iterate over all items in the 'qubits' collection.
It requests the 'id' field for every qubit in Snapshot ID {snapshot_id}.
Expected Output: A list of results showing the ID for each qubit found in the snapshot.
        """,
    )


test_wildcard_array_search()

# %%
