
# Root API Routes

Base path: `/root`. Tag: `root`. Structure mirrors `branch.md`. Endpoints and examples come from `root.py`. 

---

## GET `/root/branch`

**Summary**

Retrieve a branch by name from the storage root and load it with the requested level of detail. Returns serialized branch object (`BranchModel`) according to the selected `load_type`. 

**Query parameters**

- `branch_name` (string, optional, default=`"main"`) - name of the branch to fetch, for example `init_project`
- `load_type` (`BranchLoadType`, optional, default=`Full`) - level of detail to load for the branch

### Example

**Request:** `/root/branch?branch_name=init_project&load_type=Full`

**Response:**
```json
{
  "created_at": "2025-09-02T16:33:35+03:00",
  "id": 1,
  "name": "init_project",
  "snapshot_id": -1
}
```


---

## GET `/root/snapshot`

Loads and returns a single snapshot from storage using its identifier and the requested load-type flags.

Returns serialized snapshot (`SnapshotModel`) according to `load_type_flag`. 

**Query parameters**

- `id` (`IdType`, required) - snapshot identifier
- `load_type_flag` (`SnapshotLoadTypeFlag`, optional, default=`Metadata`) - controls which parts of the snapshot to load; accepts multiple values

### Example

**Request:**
`/root/snapshot?id=366&load_type_flag=Metadata&load_type_flag=DataWithoutRefs`

**Response:**
```json
{
  "id": 366,
  "created_at": "2025-08-22T10:54:07+03:00",
  "metadata": {
    "description": "Test calibration that wait a few seconds, then plots random data.",
    "status": null,
    "run_start": "2025-08-22T10:54:01.247+03:00",
    "run_end": "2025-08-22T10:54:07.296+03:00",
    "run_duration": 6.049,
    "name": "test_cal",
    "data_path": "2025-08-22/#366_test_cal_105407"
  },
  "data": {
    "parameters": {
      "model": {
        "qubits": ["q1", "q2"],
        "resonator": "q1.resonator",
        "sampling_points": 100
      },
      "schema": { "title": "Parameters", "type": "object" }
    },
    "outcomes": { "q1": "successful", "q2": "successful" },
    "quam": "./quam_state"
  },
  "parents": [365]
}
```


---

## GET `/root/snapshot/latest`

Returns the most recent snapshot for the storage according to the underlying storage ordering. 

**Query parameters**

- `load_type_flag` (`SnapshotLoadTypeFlag`, optional, default=`Metadata`) - controls which parts of the snapshot to load; accepts multiple values

### Example

**Request:**
`/root/snapshot/latest?load_type_flag=Metadata`

**Response:**
```json
{
  "created_at": "2025-08-22T12:16:42+03:00",
  "id": 367,
  "parents": [366],
  "metadata": {
    "name": "wf_node1",
    "description": null,
    "status": null,
    "run_start": "2025-08-22T12:16:38.123000+03:00",
    "run_end": "2025-08-22T12:16:42.134000+03:00",
    "data_path": "2025-08-22/#367_wf_node1_121642",
    "run_duration": 4.011
  },
  "data": null
}
```


---

## GET `/root/snapshot/filter`

**Summary**

Retrieve the newest, or oldest, snapshot that satisfies the provided criteria. Order is controlled by the `descending` flag. Use `/root/snapshots/filter` to get a paginated list of matches. Returns the matching snapshot, or `null` if nothing matches. 

**Query parameters**

- `descending` (bool, optional, default=`true`) - order from newest to oldest
- `name_part` (string, optional) - substring to match within snapshot name
- `min_node_id` (`IdType`, optional, default=`1`) - lower bound for node ID range
- `max_node_id` (`IdType`, optional) - upper bound for node ID range
- `min_date` (date, optional) - earliest snapshot date, inclusive
- `max_date` (date, optional) - latest snapshot date, inclusive

### Examples

#### 1)

**Request:** `/root/snapshot/filter?descending=true`

Find latest snapshot.

**Response:**
```json
{
  "created_at": "2025-08-22T12:16:42+03:00",
  "id": 367,
  "parents": [366],
  "metadata": ...,
  "data": null
}
```

#### 2)

**Request:** `/root/snapshot/filter?descending=true&name_part=test_cal`

Find latest snapshot with name contains `test_cal`.

**Response:**
```json
{
  "created_at": "2025-08-22T10:54:07+03:00",
  "id": 366,
  "parents": [365],
  "metadata": ...,
  "data": null
}
```

#### 3)

**Request:** `/root/snapshot/filter?descending=true&name_part=test_cal&max_node_id=365`

Find latest snapshot with name contains `test_cal` and id less or equal to 365.

**Response:**
```json
{
  "created_at": "2025-08-21T14:12:28+03:00",
  "id": 365,
  "parents": [364],
  "metadata": ...,
  "data": null
}
```

#### 4)

**Request:** `/root/snapshot/filter?descending=true&name_part=test_cal&max_node_id=365&max_date=2025-08-20`

Find latest snapshot with: name contains `test_cal`, id less or equal to 365, created earlier than 2025-08-20.

**Response:**
```json
{
  "created_at": "2025-08-18T15:58:57+03:00",
  "id": 353,
  "parents": [352],
  "metadata": ...,
  "data": null
}
```

#### 5)

**Request:** `/root/snapshot/filter?descending=false&name_part=test_cal&min_node_id=100&max_node_id=365&min_date=2025-05-21&max_date=2025-08-20`

Find oldest snapshot with: name contains `test_cal`, id in range(100, 365), created in range (2025-05-21, 2025-08-20).

**Response:**
```json
{
  "created_at": "2025-05-21T09:54:09+03:00",
  "id": 290,
  "parents": [289],
  "metadata": ...,
  "data": null
}
```

#### 6)

**Request:** `/root/snapshot/filter?descending=true&name_part=test_cal&min_node_id=354&max_date=2025-08-20`

Find latest snapshot with: name contains `test_cal`, id greater than or equal to 354, created at less than or equal 2025-08-20. There is no snapshot satisfying the criteria.

**Response:**
```json
null
```


---

## GET `/root/snapshots_history`

**Summary**

List snapshots history. Returns a paginated list of snapshots for the storage. Order is controlled by the `descending` flag. 

**Query parameters**

- `page` (int, optional, default=`1`) - page number, 1 based
- `per_page` (int, optional, default=`50`) - items per page
- `descending` (bool, optional, default=`true`) - order from newest to oldest
- `reverse` (bool, deprecated) - ignored, use `descending` instead
- `global_reverse` (bool, deprecated) - ignored, use `descending` instead

### Example

**Request:** `/root/snapshots_history?page=1&per_page=3`

**Response:**
```json
{
  "page": 1,
  "per_page": 3,
  "total_items": 135,
  "items": [
    {
      "created_at": "2025-08-22T12:16:42+03:00",
      "id": 367,
      "parents": [366],
      "metadata": { "name": "wf_node1", ... }
    },
    {
      "created_at": "2025-08-22T10:54:07+03:00",
      "id": 366,
      "parents": [365],
      "metadata": { "name": "test_cal", ... }
    },
    {
      "created_at": "2025-08-21T14:12:28+03:00",
      "id": 365,
      "parents": [364],
      "metadata": { "name": "test_cal", ... }
    }
  ],
  "has_next_page": true,
  "total_pages": 45
}
```


---

## GET `/root/snapshots/filter`

**Summary**

Retrieve the list of newest, or oldest, snapshots that satisfies the provided criteria. Order is controlled by the `descending` flag. Returns a paginated list of snapshots for the storage. 

**Query parameters**

- `page` (int, optional, default=`1`) - page number, 1 based
- `per_page` (int, optional, default=`50`) - items per page
- `descending` (bool, optional, default=`true`) - order from newest to oldest
- `name_part` (string, optional) - substring to match within snapshot name
- `min_node_id` (`IdType`, optional, default=`1`) - lower bound for node ID range
- `max_node_id` (`IdType`, optional) - upper bound for node ID range
- `min_date` (date, optional) - earliest snapshot date, inclusive
- `max_date` (date, optional) - latest snapshot date, inclusive

### Examples

#### 1)

**Request:** `/root/snapshots/filter?descending=true&page=1&per_page=2&name_part=test_cal`

Find snapshots with name contains `test_cal`. Return 2 latest snapshots satisfying the criteria.

**Response:**
```json
{
  "page": 1,
  "per_page": 2,
  "total_items": 135,
  "items": [
    {
      "created_at": "2025-08-22T10:54:07+03:00",
      "id": 366,
      "parents": [365],
      "metadata": { "name": "test_cal", ... }
    },
    {
      "created_at": "2025-08-21T14:12:28+03:00",
      "id": 365,
      "parents": [364],
      "metadata": { "name": "test_cal", ... }
    }
  ],
  "has_next_page": true,
  "total_pages": 68
}
```

#### 2)

**Request:** `/root/snapshots/filter?descending=true&page=5&per_page=2&name_part=test_cal`

Find snapshots with name contains `test_cal`. Return 2 snapshots while skipping 8 ((page number - 1) * per_page) snapshots. Ordered with descending created at.

**Response:**
```json
{
  "page": 5,
  "per_page": 2,
  "total_items": 135,
  "items": [
    {
      "created_at": "2025-08-21T13:59:05+03:00",
      "id": 358,
      "parents": [357],
      "metadata": { "name": "test_cal", ... }
    },
    {
      "created_at": "2025-08-21T12:35:53+03:00",
      "id": 357,
      "parents": [356],
      "metadata": { "name": "test_cal", ... }
    }
  ],
  "has_next_page": true,
  "total_pages": 68
}
```


---

## GET `/root/snapshot/search`

**Summary**

Search path values in a single snapshot. You can select the snapshot by `id`, or via the `SearchWithIdFilter` fields, then provide a `data_path`. Returns a list of occurrences. 

**Query parameters**

- `id` (`IdType`, optional) - snapshot id to target, when present it takes precedence
- `name_part` (string, optional) - substring to match within snapshot name
- `min_node_id` (`IdType`, optional, default=`1`) - lower bound for node ID range
- `max_node_id` (`IdType`, optional) - upper bound for node ID range
- `min_date` (date, optional) - earliest snapshot date, inclusive
- `max_date` (date, optional) - latest snapshot date, inclusive
- `data_path` (sequence of str | int, required) - path into the snapshot data to extract
- `descending` (bool, optional, default=`true`) - when true, list occurrences from newest to oldest

### Example

**Request:**
`/root/snapshot/search?id=366&data_path=channels.ch1.intermediate_frequency&descending=true`

**Response:**
```json
[
  {
    "key": ["channels", "ch1", "intermediate_frequency"],
    "value": 100000000,
    "snapshot": {
      "created_at": "2025-08-22T10:54:07+03:00",
      "id": 366,
      "parents": [365]
    }
  }
]
```


---

## GET `/root/snapshots/search`

**Summary**

Search for values in QUAM state along a passed `data_path` across matching snapshots. Returns a paginated result. 

**Query parameters**

- `data_path` (sequence of str | int, required) - path into the snapshot data to extract
- `filter_no_change` (bool, optional, default=`true`) - exclude consecutive entries where the value did not change
- `page` (int, optional, default=`1`) - page number, 1 based
- `per_page` (int, optional, default=`50`) - items per page
- `descending` (bool, optional, default=`true`) - order from newest to oldest
- `name_part` (string, optional) - substring to match within snapshot name
- `min_node_id` (`IdType`, optional, default=`1`) - lower bound for node ID range
- `max_node_id` (`IdType`, optional) - upper bound for node ID range
- `min_date` (date, optional) - earliest snapshot date, inclusive
- `max_date` (date, optional) - latest snapshot date, inclusive

### Examples

#### 1)

**Request:**
`/root/snapshots/search?filter_no_change=false&descending=true&data_path=channels.ch1.intermediate_frequency&page=1&per_page=3`

Get QUAM values by path `channels.ch1.intermediate_frequency` from 3 latest snapshots. Compare with the next example to see the impact of `filter_no_change`.

**Response:**
```json
{
  "page": 1,
  "per_page": 3,
  "total_items": 0,
  "items": [
    {
      "key": null,
      "value": null,
      "snapshot": {
        "created_at": "2025-08-22T12:16:42+03:00",
        "id": 367,
        "parents": [366]
      }
    },
    {
      "key": ["channels", "ch1", "intermediate_frequency"],
      "value": 100000000,
      "snapshot": {
        "created_at": "2025-08-22T10:54:07+03:00",
        "id": 366,
        "parents": [365]
      }
    },
    {
      "key": ["channels", "ch1", "intermediate_frequency"],
      "value": 100000000,
      "snapshot": {
        "created_at": "2025-08-21T14:12:28+03:00",
        "id": 365,
        "parents": [364]
      }
    }
  ],
  "has_next_page": true,
  "total_pages": 0
}
```

#### 2)

**Request:**
`/root/snapshots/search?filter_no_change=true&descending=true&data_path=channels.ch1.intermediate_frequency&page=1&per_page=3`

Get the same path with filtering when the value was not changed, so consecutive duplicates are not repeated.

**Response:**
```json
{
  "page": 1,
  "per_page": 3,
  "total_items": 0,
  "items": [
    {
      "key": null,
      "value": null,
      "snapshot": {
        "created_at": "2025-08-22T12:16:42+03:00",
        "id": 367,
        "parents": [366]
      }
    },
    {
      "key": ["channels", "ch1", "intermediate_frequency"],
      "value": 100000000,
      "snapshot": {
        "created_at": "2025-08-21T14:05:06+03:00",
        "id": 361,
        "parents": [360]
      }
    },
    {
      "key": ["channels", "ch1", "intermediate_frequency"],
      "value": 50000000,
      "snapshot": {
        "created_at": "2025-08-21T14:04:14+03:00",
        "id": 360,
        "parents": [359]
      }
    }
  ],
  "has_next_page": true,
  "total_pages": 0
}
```


---

## Deprecated node endpoints

These remain for backward compatibility.

### GET `/root/node`

**Query parameters**

- `id` (`IdType`, required) - node identifier
- `load_type` (`NodeLoadType`, optional, default=`Full`) - level of detail

**Returns**

- `NodeModel`

### GET `/root/node/latest`

**Query parameters**

- `load_type` (`NodeLoadType`, optional, default=`Full`) - level of detail

**Returns**

- `NodeModel`

### GET `/root/nodes_history`

**Query parameters**

- `page` (int, optional, default=`1`) - page number, 1 based
- `per_page` (int, optional, default=`50`) - items per page
- `descending` (bool, optional, default=`true`) - order from newest to oldest
- `reverse` (bool, deprecated) - ignored, use `descending` instead
- `global_reverse` (bool, deprecated) - ignored, use `descending` instead

**Returns**

- `PagedCollection[NodeModel]`

---