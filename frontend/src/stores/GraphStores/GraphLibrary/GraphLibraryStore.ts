import { createSlice } from "@reduxjs/toolkit";
import { ErrorObject } from "../../../modules/common/Error/ErrorStatusInterface";
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
  selectedWorkflow?: GraphWorkflow;
  lastRunInfo?: LastRunInfo;
  isRescanningGraphs: boolean;
}

const initialGraphLibraryState: GraphLibraryState = {
  allGraphs: undefined,
  selectedWorkflow: undefined,
  lastRunInfo: undefined,
  isRescanningGraphs: false,
};

export const graphLibrarySlice = createSlice({
  name: "graph/library",
  reducerPath: "library",
  initialState: initialGraphLibraryState,
  reducers: {
    setAllGraphs: (state, action) => {
      state.allGraphs = action.payload;
    },
    setSelectedWorkflow: (state, action) => {
      state.selectedWorkflow = action.payload;
    },
    setLastRunInfo: (state, action) => {
      state.lastRunInfo = action.payload;
    },
    setLastRunActive: (state) => {
      state.lastRunInfo = {
        ...state.lastRunInfo,
        active: true
      };
    },
    setIsRescanningGraphs: (state, action) => {
      state.isRescanningGraphs = action.payload;
    },
  }
});
