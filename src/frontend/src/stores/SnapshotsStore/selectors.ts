import { createSelector } from "@reduxjs/toolkit";
import { RootState } from "../index";

export const getSnapshotsState = (state: RootState) => state.snapshots;

export const getTrackLatestSidePanel = createSelector(
  getSnapshotsState,
  (state) => state.trackLatestSidePanel
);

export const getTrackPreviousSnapshot = createSelector(
  getSnapshotsState,
  (state) => state.trackPreviousSnapshot
);

export const getTotalPages = createSelector(
  getSnapshotsState,
  (state) => state.totalPages
);

export const getPageNumber = createSelector(
  getSnapshotsState,
  (state) => state.pageNumber
);

export const getAllSnapshots = createSelector(
  getSnapshotsState,
  (state) => state.allSnapshots
);

export const getSelectedSnapshotId = createSelector(
  getSnapshotsState,
  (state) => state.selectedSnapshotId
);

export const getLatestSnapshotId = createSelector(
  getSnapshotsState,
  (state) => state.latestSnapshotId
);

export const getClickedForSnapshotSelection = createSelector(
  getSnapshotsState,
  (state) => state.clickedForSnapshotSelection
);

export const getJsonData = createSelector(
  getSnapshotsState,
  (state) => state.jsonData
);

export const getJsonDataSidePanel = createSelector(
  getSnapshotsState,
  (state) => state.jsonDataSidePanel
);

export const getDiffData = createSelector(
  getSnapshotsState,
  (state) => state.diffData
);

export const getResult = createSelector(
  getSnapshotsState,
  (state) => state.result
);

export const getFirstId = createSelector(
  getSnapshotsState,
  (state) => state.firstId
);

export const getSecondId = createSelector(
  getSnapshotsState,
  (state) => state.secondId
);
