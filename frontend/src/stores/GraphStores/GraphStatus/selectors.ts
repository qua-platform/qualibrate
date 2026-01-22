import { createSelector } from "@reduxjs/toolkit";
import { getGraphState } from "../selectors";

export const getGraphStatusState = createSelector(
  getGraphState,
  (graphState) => graphState.status
);

export const getAllMeasurements = createSelector(
  getGraphStatusState,
  (statusState) => statusState.allMeasurements
);

export const getTrackLatest = createSelector(
  getGraphStatusState,
  (statusState) => statusState.trackLatest
);

export const getGraphStatuSubgraphBreadcrumbs = createSelector(
  getGraphStatusState,
  (statusState) => statusState.subgraphBreadcrumbs
);

export const getGraphStatuSelectedNodeNameInWorkflow = createSelector(
  getGraphStatusState,
  (statusState) => statusState.selectedNodeNameInWorkflow
);
