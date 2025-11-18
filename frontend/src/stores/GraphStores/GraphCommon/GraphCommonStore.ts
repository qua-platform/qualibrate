import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Edge, Node } from "@xyflow/react";

export interface IWorkflowGraphElements {
}

interface GraphState {
  selectedNodeNameInWorkflow?: string;
  nodes: Node[],
  edges: Edge[]
  shouldResetView: boolean
}

const initialCommonGraphState: GraphState = {
  selectedNodeNameInWorkflow: undefined,
  nodes: [],
  edges: [],
  shouldResetView: true,
};

export const commonGraphSlice = createSlice({
  name: "graph/common",
  reducerPath: "common",
  initialState: initialCommonGraphState,
  reducers: {
    setSelectedNodeNameInWorkflow: (state, action) => {
      state.selectedNodeNameInWorkflow = action.payload;
      state.nodes = state.nodes.map(node => ({
        ...node,
        selected: action.payload === node.id
      }));
    },
    resetWorkflowGraphElements: (state) => {
      state.nodes = [];
      state.edges = [];
    },
    setNodes: (state, action: PayloadAction<Node[]>) => {
      state.shouldResetView = false;
      state.nodes = action.payload;
    },
    setEdges: (state, action: PayloadAction<Edge[]>) => {
      state.edges = action.payload;
    },
    setShouldResetView: (state, action) => {
      state.shouldResetView = action.payload;
    }
  }
});
