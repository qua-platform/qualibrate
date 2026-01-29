import { createSlice } from "@reduxjs/toolkit";
import { SnapshotDTO } from "./api/SnapshotsApi";

interface SnapshotsState {
  trackLatestSidePanel: boolean;
  trackPreviousSnapshot: boolean;
  totalPages: number;
  pageNumber: number;
  allSnapshots: SnapshotDTO[];
  selectedSnapshotId: number | undefined;
  latestSnapshotId: number | undefined;
  clickedForSnapshotSelection: boolean;
  jsonData: object | undefined;
  jsonDataSidePanel: object | undefined;
  diffData: object | undefined;
  result: object | undefined;
  firstId: string;
  secondId: string;
}

const initialState: SnapshotsState = {
  trackLatestSidePanel: true,
  trackPreviousSnapshot: true,
  totalPages: 0,
  pageNumber: 1,
  allSnapshots: [],
  selectedSnapshotId: undefined,
  latestSnapshotId: undefined,
  clickedForSnapshotSelection: false,
  jsonData: {},
  jsonDataSidePanel: {},
  diffData: undefined,
  result: {},
  firstId: "0",
  secondId: "0",
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
      state.jsonData = undefined;
      state.result = undefined;
      state.diffData = undefined;
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
  }
});

export default SnapshotsSlice.reducer;