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

export const getWorkflowGraphElements = createSelector(
  getGraphCommonState,
  (libraryState) => libraryState.workflowGraphElements
);