import { createSlice } from "@reduxjs/toolkit";
import { SnapshotData, SnapshotDTO } from "./api/SnapshotsApi";

export interface SnapshotsState {
  trackLatestSidePanel: boolean;
  trackPreviousSnapshot: boolean;
  totalPages: number;
  pageNumber: number;
  allSnapshots: SnapshotDTO[];
  selectedSnapshot: SnapshotDTO | undefined;
  selectedWorkflow: SnapshotDTO | undefined;
  selectedNodeInWorkflowName: string | undefined;
  breadCrumbs: string[];
  allTags: string[];
  selectedSnapshotId: number | undefined;
  latestSnapshotId: number | undefined;
  clickedForSnapshotSelection: boolean;
  jsonData: SnapshotData | undefined | object;
  jsonDataSidePanel: object | undefined;
  diffData: object | undefined;
  result: object | undefined;
  firstId: string;
  secondId: string;
  reset: boolean;
}

const initialState: SnapshotsState = {
  trackLatestSidePanel: true,
  trackPreviousSnapshot: true,
  totalPages: 0,
  pageNumber: 0,
  allSnapshots: [],
  selectedSnapshot: undefined,
  selectedWorkflow: undefined,
  selectedNodeInWorkflowName: undefined,
  breadCrumbs: [],
  allTags: [],
  selectedSnapshotId: undefined,
  latestSnapshotId: undefined,
  clickedForSnapshotSelection: false,
  jsonData: {},
  jsonDataSidePanel: {},
  diffData: undefined,
  result: {},
  firstId: "0",
  secondId: "0",
  reset: false,
};

export const SnapshotsSlice = createSlice({
  name: "snapshots",
  initialState,
  reducers: {
    setTrackLatestSidePanel: (state, action) => {
      state.trackLatestSidePanel = action.payload;
    },
    setTrackPreviousSnapshot: (state, action) => {
      state.trackPreviousSnapshot = action.payload;
    },
    setPageNumber: (state, action) => {
      state.pageNumber = action.payload;
    },
    setTotalPages: (state, action) => {
      state.totalPages = action.payload;
    },
    setAllSnapshots: (state, action) => {
      state.allSnapshots = action.payload;
    },
    setSelectedSnapshot: (state, action) => {
      state.selectedSnapshot = action.payload;
    },
    setSelectedWorkflow: (state, action) => {
      state.selectedWorkflow = action.payload;
    },
    setSelectedNodeInWorkflowName: (state, action) => {
      state.selectedNodeInWorkflowName = action.payload;
    },
    setSubgraphForward: (state, action) => {
      state.breadCrumbs = [...state.breadCrumbs, action.payload];
    },
    setSubgraphBack: (state, action) => {
      state.breadCrumbs.splice(action.payload, state.breadCrumbs.length);
    },
    setAllTags: (state, action) => {
      state.allTags = action.payload;
    },
    setSelectedSnapshotId: (state, action) => {
      state.selectedSnapshotId = action.payload;
    },
    setLatestSnapshotId: (state, action) => {
      state.latestSnapshotId = action.payload;
    },
    setClickedForSnapshotSelection: (state, action) => {
      state.clickedForSnapshotSelection = action.payload;
    },
    setJsonData: (state, action) => {
      state.jsonData = action.payload;
    },
    setJsonDataSidePanel: (state, action) => {
      state.jsonDataSidePanel = action.payload;
    },
    setDiffData: (state, action) => {
      state.diffData = action.payload;
    },
    clearData: (state) => {
      state.selectedSnapshotId = undefined;
      state.selectedSnapshot = undefined;
      state.selectedWorkflow = undefined;
      state.selectedNodeInWorkflowName = undefined;
      state.jsonData = undefined;
      state.result = undefined;
      state.diffData = undefined;
      state.reset = true;
    },
    setResult: (state, action) => {
      state.result = action.payload;
    },
    setFirstId: (state, action) => {
      state.firstId = action.payload;
    },
    setSecondId: (state, action) => {
      state.secondId = action.payload;
    },
    setReset: (state, action) => {
      state.reset = action.payload;
    },
  },
});

export default SnapshotsSlice.reducer;
