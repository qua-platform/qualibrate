import React, { useContext, useState } from "react";
import { NodeDTO } from "../components/NodeElement";
import noop from "../../../common/helpers";

interface INodesContext {
  selectedNode?: NodeDTO;
  setSelectedNode: (selectedNode: NodeDTO) => void;
  allNodes: NodeDTO[];
  setAllNodes: (nodes: NodeDTO[]) => void;
}

const NodesContext = React.createContext<INodesContext>({
  selectedNode: undefined,
  setSelectedNode: noop,
  allNodes: [],
  setAllNodes: noop,
});

export const useNodesContext = (): INodesContext => useContext<INodesContext>(NodesContext);

interface NodesContextProviderProps {
  children: React.JSX.Element;
}

export function NodesContextProvider(props: NodesContextProviderProps): React.ReactElement {
  const [allNodes, setAllNodes] = useState<NodeDTO[]>([
    {
      name: "Readout name",
      title: "Readout",
      description: "Find center frequency and rough width",
      input_parameters: {
        bool_val: { default: false, title: "Bool Val", type: "boolean" },
        float_val: { title: "Float Val", type: "number" },
        int_val: { default: 0, title: "Int Val", type: "integer" },
        str_val: { default: "string", title: "Str Val", type: "string" },
      },
    },
    {
      name: "Paramp",
      description: "Identify suitable pump frequency, pump amplitude, DC bias",
      input_parameters: {
        bool_val: { default: false, title: "Bool Val", type: "boolean" },
        float_val: { title: "Float Val", type: "number" },
        int_val: { default: 0, title: "Int Val", type: "integer" },
        str_val: { default: "string", title: "Str Val", type: "string" },
      },
    },
  ]);
  const [selectedNode, setSelectedNode] = useState<NodeDTO | undefined>(undefined);
  return (
    <NodesContext.Provider
      value={{
        selectedNode,
        setSelectedNode,
        allNodes,
        setAllNodes,
      }}
    >
      {props.children}
    </NodesContext.Provider>
  );
}
