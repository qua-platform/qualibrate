import { createSelector } from "@reduxjs/toolkit";
import { getGraphState } from "../selectors";
import { GraphLibraryState } from "./GraphLibraryStore";

export const getGraphLibraryState = createSelector(
  getGraphState,
  (graphState) => graphState.library
);

export const getSelectedWorkflowName = createSelector(getGraphLibraryState, (libraryState: GraphLibraryState) => libraryState.selectedWorkflowName);

export const getSelectedNodeNameInWorkflow = createSelector(getGraphLibraryState, (libraryState: GraphLibraryState) => libraryState.selectedNodeNameInWorkflow);

export const getSubgraphBreadcrumbs = createSelector(
  getGraphLibraryState,
  getSelectedWorkflowName,
  (libraryState, selectedWorkflowName) => libraryState.subgraphBreadcrumbs[selectedWorkflowName || ""] || []
);

export const getAllGraphs = createSelector(
  getGraphLibraryState,
  (libraryState) => libraryState.allGraphs
);

export const getSelectedWorkflow = createSelector(
  getAllGraphs,
  getSelectedWorkflowName,
  getSubgraphBreadcrumbs,
  (allGraphs = {}, selectedWorkflowName = "", subgraphBreadcrumbs) =>
    subgraphBreadcrumbs.reduce((currentGraph, key) => {
      const node = currentGraph.nodes?.[key];
      return node ?? currentGraph;
    }, allGraphs[selectedWorkflowName])
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

export const getErrorObject = createSelector(
  getGraphLibraryState,
  (libraryState) => libraryState.errorObject
);
