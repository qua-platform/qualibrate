# Node.json

The structure of `node.json` closely mimics the timeline DB snapshot structure in a simplified form.

- `created_at`: (Required) date + time at which snapshot was stored 
  - Form: `YYYY-MM-DDTHH:mm:ss±XX:XX` (ISO-8601)
  - E.g. `'2024-04-16T05:49:55+02:00'`
- `metadata`: (Required) user-specified metadata
  - Type: `Dict[str, Any]`
  - Empty dict if no metadata
- `data`: (Optional) container for QuAM data (and other)
  - Type: `Dict[str, Any]`
  - Should have top-level entry "quam"
  - Non-existing if node has no data
  - Can be JSON reference to external files
- `id`: (Required) unique identifier for snapshot
  - Type: `int`
  - `id` is unique within project
  - `id` starts at idx 1, and increments by 1 every time
- `parents`: (Required) list of parent IDs
  - Type: `List[int]`
  - These are a list of parent snapshots 
  - Usually there is only one, but there can be multiple in case of two branches merging 
  - If there are multiple branches, the first list id is considered the main branch, and the second list id is the branch that is merged from. 
  - Empty list if node has no parents 
  - This usually corresponds to the first node with id=1

### Example
```json lines
{
  "created_at": "2024-04-29T18:02:03+02:00"
  "metadata": {
    "name": "node_name",
    "data_path": "2024-03-13/#144_node_name_173039"
    // Other metadata entries
  },
  "data": {
    "quam": "./state.json"
  },
  "parents": [
    143
  ],
  "id": 144,
}
```
