import { InputParameter } from "../../../../../src/components";
import { NodeMap } from "../../../../../src/modules/Nodes";

export const arrayParameterMock = {
  array: {
    title: "Array",
    default: [
        "Option 1",
        "Option 3"
    ],
    options: [
      { "id": "Option 1", "title": "Option 1" },
      { "id": "Option 2", "title": "Option 2 long option long option long option long option" },
      { "id": "Option 3", "title": "Option 3" },
      { "id": "Option 4", "title": "Option 4" },
      { "id": "Option 5", "title": "Option 5" },
      { "id": "Option 6", "title": "Option 6" },
      { "id": "Option 7", "title": "Option 7" },
      { "id": "Option 8", "title": "Option 8" },
      { "id": "Option 9", "title": "Option 9" },
      { "id": "Option 10", "title": "Option 10" },
      { "id": "Option 11", "title": "Option 11" },
      { "id": "Option 12", "title": "Option 12" },
      { "id": "Option 13", "title": "Option 13" },
      { "id": "Option 14", "title": "Option 14" },
      { "id": "Option 15", "title": "Option 15" },
      { "id": "Option 16", "title": "Option 16" },
      { "id": "Option 17", "title": "Option 17" },
      { "id": "Option 18", "title": "Option 18" },
      { "id": "Option 19", "title": "Option 19" },
      { "id": "Option 20", "title": "Option 20" },
      { "id": "Option 21", "title": "Option 21" },
      { "id": "Option 22", "title": "Option 22" },
      { "id": "Option 23", "title": "Option 23" },
      { "id": "Option 24", "title": "Option 24" },
      { "id": "Option 25", "title": "Option 25" },
      { "id": "Option 26", "title": "Option 26" },
      { "id": "Option 27", "title": "Option 27" },
      { "id": "Option 28", "title": "Option 28" },
      { "id": "Option 29", "title": "Option 29" },
      { "id": "Option 30", "title": "Option 30" },
      { "id": "Option 31", "title": "Option 31" },
      { "id": "Option 32", "title": "Option 32" },
      { "id": "Option 33", "title": "Option 33" },
      { "id": "Option 34", "title": "Option 34" },
      { "id": "Option 35", "title": "Option 35" },
      { "id": "Option 36", "title": "Option 36" },
      { "id": "Option 37", "title": "Option 37" },
      { "id": "Option 38", "title": "Option 38" },
      { "id": "Option 39", "title": "Option 39" },
      { "id": "Option 40", "title": "Option 40" },
      { "id": "Option 41", "title": "Option 41" },
      { "id": "Option 42", "title": "Option 42" },
      { "id": "Option 43", "title": "Option 43" },
      { "id": "Option 44", "title": "Option 44" },
      { "id": "Option 45", "title": "Option 45" },
      { "id": "Option 46", "title": "Option 46" },
      { "id": "Option 47", "title": "Option 47" },
      { "id": "Option 48", "title": "Option 48" },
      { "id": "Option 49", "title": "Option 49" },
      { "id": "Option 50", "title": "Option 50" },
    ],
    type: "array",
    is_targets: true
  }
};

// Can be used to add mock parameter to nodes
// in frontend/src/stores/NodesStore/actions.ts in fetchAllNodes pass
// server response to this function and put it's return into store
// like this `dispatch(setAllNodes(createNodesMock(response.result! as NodeMap)));`
export const createNodesMock = (nodes: NodeMap) => Object.entries(nodes || {})
  .reduce((acc, [key, node]) => ({
      ...acc,
      [key]: {
        ...node,
        parameters: {
          ...node.parameters,
          ...arrayParameterMock,
        }
      }
    }), {});