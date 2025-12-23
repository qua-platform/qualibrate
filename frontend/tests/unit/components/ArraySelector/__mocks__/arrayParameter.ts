import { InputParameter } from "../../../../../src/components";
import { NodeMap } from "../../../../../src/modules/Nodes";

const parameterOptions = Array.from({ length: 50 }).map((_, index) => ({
  id: `q${index}`,
  title: `q${index}${index === 2 ? 'long option long option long option long option' : ''}`,
  online: index % 3 !== 0,
  percent: index,
  lastRun: `${index}h ago`,
}))

export const arrayParameterMock = {
  array: {
    title: "Array",
    default: [
        parameterOptions[0].id,
        parameterOptions[2].id,
        parameterOptions[5].id,
    ],
    options: parameterOptions,
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
          qubits: {
            ...node.parameters!.qubits,
            options: parameterOptions,
          },
          ...arrayParameterMock,
        }
      }
    }), {});