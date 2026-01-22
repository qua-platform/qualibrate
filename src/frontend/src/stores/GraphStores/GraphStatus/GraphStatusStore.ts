import { createSlice } from "@reduxjs/toolkit";

export interface GlobalParameterStructure {
  [key: string]: string | number;
}

export interface Measurement {
  created_at?: string;
  id?: number;
  data?: {
    outcomes: object;
    parameters: GlobalParameterStructure;
    error: object | null;
  };
  metadata?: {
    run_duration?: number;
    name?: string;
    description?: string;
    run_end?: string;
    run_start?: string;
    status?: string;
  };
  elements_history?: {
    items: Measurement[];
  };
}

interface GraphStatusState {
  allMeasurements?: Measurement[];
  trackLatest: boolean;
  subgraphBreadcrumbs: string[]
  selectedNodeNameInWorkflow?: string
}

const initialGraphStatusState: GraphStatusState = {
  allMeasurements: [],
  trackLatest: false,
  subgraphBreadcrumbs: [],
  selectedNodeNameInWorkflow: undefined,
};

const graphStatusSlice = createSlice({
  name: "graph/status",
  reducerPath: "status",
  initialState: initialGraphStatusState,
  reducers: {
    setAllMeasurements: (state, action) => {
      state.allMeasurements = action.payload;
    },
    setTrackLatest: (state, action) => {
      state.trackLatest = action.payload;
    },
    setSelectedNodeNameInWorkflow: (state, action) => {
      state.selectedNodeNameInWorkflow = action.payload;
    },
    setSubgraphBreadcrumbs: (state, action) => {
      state.subgraphBreadcrumbs = action.payload;
    },
    setSubgraphForward: (state, action) => {
      state.subgraphBreadcrumbs = state.subgraphBreadcrumbs
        ? [ ...state.subgraphBreadcrumbs, action.payload ]
        : [ action.payload ];
    },
    setSubgraphBack: (state, action) => {
      state.subgraphBreadcrumbs.splice(
        action.payload,
        state.subgraphBreadcrumbs.length
      );
    },
  },
});

export default graphStatusSlice;
