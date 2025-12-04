# Snapshot Search and Querying

This feature enables powerful querying capabilities for Snapshots in Qualibrate. It allows you to perform "database-like" operations to find specific snapshots based on metadata or to search for specific data values (e.g., Qubit parameters) across the history of your calibration experiments.

## Overview

There are two main types of operations:
1.  **Snapshot Filtering**: Finding snapshots based on metadata (Name, ID, Creation Date).
2.  **Data Searching**: Querying the internal JSON content (QuAM state) of snapshots to retrieve specific values or track their changes over time.

## Snapshot Filtering (Metadata)

These endpoints allow you to filter the list of available snapshots. This is useful when you need to find a specific experiment or set of experiments.

### Endpoints

- **Find Single Snapshot**: `GET /api/root/snapshot/filter`
  - Returns the single newest (or oldest) snapshot matching the criteria.
- **List Snapshots**: `GET /api/root/snapshots/filter`
  - Returns a paginated list of all snapshots matching the criteria.

### Query Parameters

| Parameter | Type | Description |
| :--- | :--- | :--- |
| `name_part` | `string` | Substring match within the snapshot name (e.g., `test_cal`). |
| `min_node_id` | `integer` | Minimum Snapshot ID (inclusive). |
| `max_node_id` | `integer` | Maximum Snapshot ID (inclusive). |
| `min_date` | `date` | Earliest creation date (YYYY-MM-DD). |
| `max_date` | `date` | Latest creation date (YYYY-MM-DD). |
| `descending` | `boolean` | Sort order. `true` for newest first (default), `false` for oldest first. |
| `page` | `integer` | Page number (for list endpoint). |
| `per_page` | `integer` | Items per page (for list endpoint). |

### Examples

**Find the latest snapshot with "calibration" in the name:**
```http
GET /api/root/snapshot/filter?name_part=calibration&descending=true
```

**Find all snapshots created in August 2025:**
```http
GET /api/root/snapshots/filter?min_date=2025-08-01&max_date=2025-08-31
```

---

## Data Searching (QuAM State)

These features allow you to query the *content* of the snapshots. This is particularly powerful for tracking how specific parameters (like frequencies, pulse amplitudes, etc.) have evolved over the course of your experiments.

### 1. Search Across History (Parameter Tracking)

Use this to see the history of a specific value across multiple snapshots.

**Endpoint:** `GET /api/root/snapshots/search`

**Key Parameters:**
- `data_path`: The dot-separated path to the value in the JSON structure (e.g., `channels.ch1.intermediate_frequency`).
- `filter_no_change`: If `true` (default), only returns entries where the value *changed* compared to the previous snapshot.
- Metadata filters (`name_part`, `min_date`, etc.) are also supported to narrow down the search scope.

**Example: Track changes to a qubit's frequency:**
```http
GET /api/root/snapshots/search?data_path=qubits.q1.frequency&filter_no_change=true
```

### 2. Search Within a Single Snapshot

Use this to extract specific values from a known snapshot or the first snapshot matching your criteria.

**Endpoint:** `GET /api/root/snapshot/search` (or `GET /api/snapshot/{id}/search/data/values`)

**Key Parameters:**
- `id`: (Optional) Exact Snapshot ID.
- `data_path`: The path to the value.
- Metadata filters (if `id` is not provided).

**Example: Get the readout fidelity from the latest calibration:**
```http
GET /api/root/snapshot/search?name_part=readout_fidelity&descending=true&data_path=results.fidelity
```

### 3. Recursive Search (Deep Search)

Use this if you know the key name but not the full path. It searches the entire JSON structure recursively.

**Endpoint:** `GET /api/snapshot/{id}/search/data/value/any_depth`

**Key Parameters:**
- `target_key`: The key name to search for (e.g., `frequency`).

---

## Backend Support

Currently, the Snapshot Search and Querying features described above are fully supported only for the **LocalStorage** backend.

The `TimelineDb` (Timeline Database) is a planned future feature that will introduce a PostgreSQL backend. It is not yet implemented, and therefore should be ignored for now.

## Data Path Syntax

The `data_path` parameter is used to navigate the nested JSON structure of the snapshot data.

- **Dot Notation**: Use dots to separate keys.
  - Example: `channels.ch1.port` accesses `data["channels"]["ch1"]["port"]`.
- **Array Indices**: Use numbers to access array elements.
  - Example: `qubits.list.0` accesses the first element of the list.
- **Wildcards**: Use `*` to match any key or index at that level (if supported by the backend implementation).

## Response Structure

Search results typically return a list of "MachineSearchResults" which include:
- `key`: The full path to the found value (as a list of strings/integers).
- `value`: The actual value found.
- `snapshot`: Metadata of the snapshot where this value was found (ID, creation time, etc.).

```json
{
  "page": 1,
  "per_page": 50,
  "total_items": 0, // Note: Total items count might be 0 if not calculated for search queries
  "items": [
    {
      "key": ["channels", "ch1", "intermediate_frequency"],
      "value": 100000000,
      "snapshot": {
        "id": 366,
        "created_at": "2025-08-22T10:54:07+03:00",
        "metadata": { "name": "test_cal" }
      }
    }
  ]
}
```
