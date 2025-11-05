import { createSelector } from "@reduxjs/toolkit";
import { getGraphState } from "../selectors";

export const getGraphStatusState = createSelector(
  getGraphState,
  (graphState) => graphState.status
)

export const getAllMeasurements = createSelector(
  getGraphStatusState,
  (statusState) => statusState.allMeasurements
)

export const getTrackLatest = createSelector(
  getGraphStatusState,
  (statusState) => statusState.trackLatest
)
