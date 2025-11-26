import { FetchGraphResponse } from "@/modules/GraphLibrary/api/GraphLibraryApi";
import { createSlice } from "@reduxjs/toolkit";
import { Edge, Node } from "@xyflow/react";

export type EdgeData = {
  condition?: boolean
}

export type NodeData = {
  label: string
  subgraph?: {
    nodes: NodeWithData[],
    edges: EdgeWithData[]
  }
}

export type NodeWithData = Node<NodeData>
export type EdgeWithData = Edge<EdgeData>

interface GraphState {
  selectedWorkflowName?: string;
  selectedNodeNameInWorkflow?: string
  // workflow graph returned from backend as is
  unformattedWorkflowElements?: FetchGraphResponse
  // graph that is currently shown in UI with applied layout and selected subgraph
  nodes: NodeWithData[]
  edges: EdgeWithData[]
  shouldResetView: boolean
  // Key represents workflow graph,
  // value is array of ids of nodes that contains subgraph that is currently opened
  subgraphBreadcrumbs: Record<string, string[]>
}

const initialCommonGraphState: GraphState = {
  selectedWorkflowName: undefined,
  selectedNodeNameInWorkflow: undefined,
  unformattedWorkflowElements: undefined,
  nodes: [],
  edges: [],
  shouldResetView: true,
  subgraphBreadcrumbs: {}
};

export const commonGraphSlice = createSlice({
  name: "graph/common",
  reducerPath: "common",
  initialState: initialCommonGraphState,
  reducers: {
    setSelectedWorkflowName: (state, action) => {
      state.selectedWorkflowName = action.payload;
    },
    setSelectedNodeNameInWorkflow: (state, action) => {
      state.selectedNodeNameInWorkflow = action.payload;
      state.nodes = state.nodes.map(node => ({
        ...node,
        selected: action.payload === node.data.label
      }));
    },
    resetWorkflowGraphElements: (state) => {
      state.unformattedWorkflowElements = undefined;
      state.nodes = [];
      state.edges = [];
      state.subgraphBreadcrumbs = {};
    },
    setUnformattedWorkflowElements: (state, action) => {
      state.unformattedWorkflowElements = action.payload;
    },
    setNodes: (state, action) => {
      state.shouldResetView = false;
      state.nodes = action.payload;
    },
    setEdges: (state, action) => {
      state.edges = action.payload;
    },
    setShouldResetView: (state, action) => {
      state.shouldResetView = action.payload;
    },
    setSubgraphForward: (state, action) => {
      if (state.selectedWorkflowName) {
        state.subgraphBreadcrumbs[state.selectedWorkflowName] = state.subgraphBreadcrumbs[state.selectedWorkflowName]
          ? [ ...state.subgraphBreadcrumbs[state.selectedWorkflowName], action.payload ]
          : [ action.payload ];
      }
    },
    setSubgraphBack: (state, action) => {
      if (state.selectedWorkflowName)
        state.subgraphBreadcrumbs[state.selectedWorkflowName].splice(
          action.payload,
          state.selectedWorkflowName.length
        );
    },
  }
});
