import { QubitMetadataList } from "../../../../../src/components/Parameters/Parameters";
import { NodeMap } from "../../../../../src/modules/Nodes";

export const qubitDefaultMock = ["q1 long long long long", "q2", "q4"];
export const qubitMetadata = Array.from({ length: 50 })
  .map((_, index) => index)
  .reduce((acc, index) => ({
    ...acc,
    [index === 0 ? "q1 long long long long" : `q${index}`]: {
      active: index % 3 !== 0,
      fidelity: index,
    }
  }), {} as QubitMetadataList);

export const enumParameterMock = {
  array: {
    title: "Enum",
    default: 'q0',
    enum: Array.from({ length: 50 }).map((_, index) => `q${index}`),
    type: "string",
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
            metadata: qubitMetadata,
          },
          ...enumParameterMock,
        }
      }
    }), {});