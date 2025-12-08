import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ErrorObject } from "../../../components/Error/ErrorStatusInterface";
import { GraphWorkflow } from "../../../modules/GraphLibrary/components/GraphList";

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

interface GraphLibraryState {
  allGraphs?: GraphMap;
  lastRunInfo?: LastRunInfo;
  isRescanningGraphs: boolean;
  errorObject: unknown;
}

const initialGraphLibraryState: GraphLibraryState = {
  allGraphs: undefined,
  lastRunInfo: undefined,
  isRescanningGraphs: false,
  errorObject: undefined,
};

export const graphLibrarySlice = createSlice({
  name: "graph/library",
  reducerPath: "library",
  initialState: initialGraphLibraryState,
  reducers: {
    setAllGraphs: (state, action) => {
      state.allGraphs = action.payload;
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
      newValue: boolean | number | string
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
        graph.parameters[paramKey].default = newValue;
    },
    setErrorObject: (state, action) => {
      state.errorObject = action.payload;
    }
  },
});
