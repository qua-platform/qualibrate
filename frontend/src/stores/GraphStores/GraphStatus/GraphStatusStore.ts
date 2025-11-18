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
}

interface GraphStatusState {
  allMeasurements?: Measurement[];
  trackLatest: boolean;
}

const initialGraphStatusState: GraphStatusState = {
  allMeasurements: [],
  trackLatest: false,
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
  }
});

export default graphStatusSlice;
