import { createSelector } from "@reduxjs/toolkit";
import { getGraphState } from "../selectors";

export const getGraphCommonState = createSelector(
  getGraphState,
  (graphState) => graphState.common
);

export const getSelectedWorkflowName = createSelector(
  getGraphCommonState,
  (graphCommon) => graphCommon.selectedWorkflowName
);

export const getSelectedNodeNameInWorkflow = createSelector(
  getGraphCommonState,
  (graphCommon) => graphCommon.selectedNodeNameInWorkflow
);

export const getUnformattedWorkflowElements = createSelector(
  getGraphCommonState,
  (graphCommon) => graphCommon.unformattedWorkflowElements
);

export const getSubgraphBreadcrumbs = createSelector(
  getGraphCommonState,
  getSelectedWorkflowName,
  (graphCommon, selectedWorkflowName) => graphCommon.subgraphBreadcrumbs[selectedWorkflowName || ""] || []
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
