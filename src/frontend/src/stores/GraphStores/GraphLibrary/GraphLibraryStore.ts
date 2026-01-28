import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ErrorObject } from "../../../components";
import { GraphWorkflow } from "../../../modules/GraphLibrary";
import { Node, Edge } from "@xyflow/react";

export type EdgeData = {
  connect_on?: boolean;
  loop?: {
    label?: string;
    content?: string;
    max_iterations?: number;
  };
  condition?: {
    label?: string;
    content?: string;
  };
};

export type NodeData = {
  label: string;
  subgraph?: {
    nodes: NodeWithData[];
    edges: EdgeWithData[];
  };
};

export type NodeWithData = Node<NodeData>;
export type EdgeWithData = Edge<EdgeData>;


export interface LastRunInfo {
  workflowName?: string;
  active?: boolean;
  activeNodeName?: string;
  nodesCompleted?: number;
  nodesTotal?: number;
  runDuration?: number;
  status?: string;
  error?: ErrorObject;
  errorMessage?: string;
}

export interface GraphMap {
  [key: string]: GraphWorkflow;
}

export interface GraphLibraryState {
  allGraphs?: GraphMap;
  selectedWorkflowName?: string;
  selectedNodeNameInWorkflow?: string
  lastRunInfo?: LastRunInfo;
  isRescanningGraphs: boolean;
  errorObject: unknown;
  // Key represents workflow graph,
  // value is array of ids of nodes that contains subgraph that is currently opened
  subgraphBreadcrumbs: Record<string, string[]>
}

const initialGraphLibraryState: GraphLibraryState = {
  allGraphs: undefined,
  selectedWorkflowName: undefined,
  selectedNodeNameInWorkflow: undefined,
  lastRunInfo: undefined,
  isRescanningGraphs: false,
  errorObject: undefined,
  subgraphBreadcrumbs: {}
};

export const graphLibrarySlice = createSlice({
  name: "graph/library",
  reducerPath: "library",
  initialState: initialGraphLibraryState,
  reducers: {
    setAllGraphs: (state, action) => {
      state.allGraphs = action.payload;

      const applyDefaultValue = (workflow?: GraphMap) =>
        Object.values(workflow || {}).map(graph => {
          Object.values(graph.parameters || {}).map(parameter =>
            parameter.value = parameter.default
          );
          graph.nodes && applyDefaultValue(graph.nodes);
        });

      applyDefaultValue(state.allGraphs);
    },
    setSelectedWorkflowName: (state, action) => {
      state.selectedWorkflowName = action.payload;
    },
    setSelectedNodeNameInWorkflow: (state, action) => {
      state.selectedNodeNameInWorkflow = action.payload;
    },
    setLastRunInfo: (state, action) => {
      state.lastRunInfo = action.payload;
    },
    setLastRunActive: (state) => {
      state.lastRunInfo = {
        ...state.lastRunInfo,
        active: true,
      };
    },
    setIsRescanningGraphs: (state, action) => {
      state.isRescanningGraphs = action.payload;
    },
    setNodeParameter: (state, action: PayloadAction<{
      paramKey: string
      newValue: boolean | number | string | string[] | undefined
      nodeId?: string
      selectedWorkflowName?: string
      subgraphBreadcrumbs: string[]
    }>) => {
      const { paramKey, newValue, nodeId, subgraphBreadcrumbs, selectedWorkflowName } = action.payload;
      const { allGraphs } = state;

      if (!allGraphs || !selectedWorkflowName) return state;

      let graph = subgraphBreadcrumbs.reduce((currentGraph, key) => {
        const node = currentGraph.nodes?.[key];
        return node ?? currentGraph;
      }, allGraphs[selectedWorkflowName]);

      if (graph.nodes && nodeId) {
        graph = graph.nodes[nodeId];
      }

      if (graph.parameters)
        graph.parameters[paramKey].value = newValue;
    },
    setErrorObject: (state, action) => {
      state.errorObject = action.payload;
    },
    setSubgraphBreadcrumbs: (state, action) => {
      if (state.selectedWorkflowName)
        state.subgraphBreadcrumbs[state.selectedWorkflowName] = action.payload;
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
  },
});