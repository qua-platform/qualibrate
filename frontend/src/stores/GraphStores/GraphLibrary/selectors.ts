import { createSelector } from "@reduxjs/toolkit";
import { getGraphState } from "../selectors";

export const getGraphLibraryState = createSelector(
  getGraphState,
  (graphState) => graphState.library
);

export const getAllGraphs = createSelector(
  getGraphLibraryState,
  (libraryState) => libraryState.allGraphs
);

export const getSelectedWorkflow = createSelector(
  getGraphLibraryState,
  (libraryState) => libraryState.selectedWorkflow
);

export const getLastRunInfo = createSelector(
  getGraphLibraryState,
  (libraryState) => libraryState.lastRunInfo
);

export const getLastRunNodeName = createSelector(
  getLastRunInfo,
  (lastRunInfo) => lastRunInfo?.activeNodeName
);

export const getLastRunWorkflowName = createSelector(
  getLastRunInfo,
  (lastRunInfo) => lastRunInfo?.workflowName
);

export const getLastRunError = createSelector(
  getLastRunInfo,
  (lastRunInfo) => lastRunInfo?.error
);

export const getIsRescanningGraphs = createSelector(
  getGraphLibraryState,
  (libraryState) => libraryState.isRescanningGraphs
);
