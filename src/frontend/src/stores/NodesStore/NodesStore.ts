import { createSlice } from "@reduxjs/toolkit";
import { ErrorObject } from "../../components";
import { NodeDTO, NodeMap } from "../../modules/Nodes";

export interface StateUpdateObject {
  key?: string | number;
  attr?: string;
  old?: string | number | object | number[];
  val?: string | number | object | number[];
  new?: string | number | object | number[];
  updated?: boolean;
  stateUpdated?: boolean;
}

export interface StateUpdate {
  [key: string]: StateUpdateObject;
}

export interface RunningNodeInfo {
  timestampOfRun?: string;
  runDuration?: string;
  status?: string;
  lastRunNodeName?: string;
  state_updates?: StateUpdate;
  error?: ErrorObject;
  idx?: string;
}

export interface ErrorWithDetails {
  detail: { input?: string; type?: string; loc?: string[]; msg: string }[];
}

export interface ResponseStatusError {
  nodeName: string;
  name: string;
  msg: string;
}

export interface StatusResponseType {
  idx: number;
  completed_at?: string;
  status: string;
  error?: ErrorObject;
  name: string;
  state_updates?: StateUpdate;
  run_result?: {
    name?: string;
    created_at?: string;
    completed_at?: string;
    run_duration?: number;
    parameters?: {
      [key: string]: string;
    };
  };
  passed_parameters?: {
    [key: string]: string | number;
  };
}

interface NodesState {
  selectedNode?: string
  submitNodeResponseError?: ResponseStatusError;
  runningNode?: NodeDTO;
  runningNodeInfo?: RunningNodeInfo;
  allNodes?: NodeMap;
  isNodeRunning: boolean;
  results?: unknown | object;
  isAllStatusesUpdated: boolean;
  updateAllButtonPressed: boolean;
  isRescanningNodes: boolean;
}

const initialState: NodesState = {
  selectedNode: undefined,
  submitNodeResponseError: undefined,
  runningNode: undefined,
  runningNodeInfo: undefined,
  allNodes: undefined,
  isNodeRunning: false,
  results: undefined,
  isAllStatusesUpdated: false,
  updateAllButtonPressed: false,
  isRescanningNodes: false,
};

export const nodesSlice = createSlice({
  name: "nodes",
  initialState,
  reducers: {
    setSelectedNode: (state, action) => {
      state.selectedNode = action.payload;
    },
    setSubmitNodeResponseError: (state, action) => {
      state.submitNodeResponseError = action.payload;
    },
    setRunningNode: (state, action) => {
      state.runningNode = action.payload;
    },
    runNode: (state, action) => {
      state.isNodeRunning = true;
      state.results = {};
      state.updateAllButtonPressed = false;
      state.isAllStatusesUpdated = false;
      state.runningNode = action.payload;
      state.submitNodeResponseError = undefined;
    },
    setRunningNodeInfo: (state, action) => {
      state.runningNodeInfo = action.payload;
    },
    setAllNodes: (state, action) => {
      state.allNodes = action.payload;
      Object.values(state.allNodes || {}).map((node) =>
        Object.values(node.parameters || {}).map(parameter =>
          parameter.value = parameter.default
        )
      );
    },
    setNodeParameter: (state, action) => {
      const { nodeKey, paramKey, newValue } = action.payload;
      if (state.allNodes && state.allNodes[nodeKey].parameters)
        state.allNodes[nodeKey].parameters[paramKey].value = newValue;
    },
    setIsNodeRunning: (state, action) => {
      state.isNodeRunning = action.payload;
    },
    setResults: (state, action) => {
      state.results = action.payload;
    },
    setIsAllStatusesUpdated: (state, action) => {
      state.isAllStatusesUpdated = action.payload;
    },
    setUpdateAllButtonPressed: (state, action) => {
      state.updateAllButtonPressed = action.payload;
    },
    setIsRescanningNodes: (state, action) => {
      state.isRescanningNodes = action.payload;
    },
  }
});

export default nodesSlice.reducer;