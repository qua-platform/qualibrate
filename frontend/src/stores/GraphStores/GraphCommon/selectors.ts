import { createSelector } from "@reduxjs/toolkit";
import { getGraphState } from "../selectors";

export const getGraphCommonState = createSelector(
  getGraphState,
  (graphState) => graphState.common
);

export const getSelectedNodeNameInWorkflow = createSelector(
  getGraphCommonState,
  (graphCommon) => graphCommon.selectedNodeNameInWorkflow
);

export const getWorkflowGraphNodes = createSelector(
  getGraphCommonState,
  (libraryState) => libraryState.nodes
);

export const getWorkflowGraphEdges = createSelector(
  getGraphCommonState,
  (libraryState) => libraryState.edges
);

export const getShouldResetView = createSelector(
  getGraphCommonState,
  (graphCommon) => graphCommon.shouldResetView
);
