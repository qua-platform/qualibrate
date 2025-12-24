import { createSelector } from "@reduxjs/toolkit";
import { getGraphState } from "../selectors";
import { LOOPING_EDGE_TYPE } from "../../../modules/Graph";
import { MarkerType } from "@xyflow/react";

export const getGraphCommonState = createSelector(getGraphState, (graphState) => graphState.common);

export const getSelectedWorkflowName = createSelector(getGraphCommonState, (graphCommon) => graphCommon.selectedWorkflowName);

export const getSelectedNodeNameInWorkflow = createSelector(getGraphCommonState, (graphCommon) => graphCommon.selectedNodeNameInWorkflow);

export const getUnformattedWorkflowElements = createSelector(getGraphCommonState, (graphCommon) => graphCommon.unformattedWorkflowElements);

export const getSubgraphBreadcrumbs = createSelector(
  getGraphCommonState,
  getSelectedWorkflowName,
  (graphCommon, selectedWorkflowName) => graphCommon.subgraphBreadcrumbs[selectedWorkflowName || ""] || []
);

export const getWorkflowGraphNodes = createSelector(getGraphCommonState, (libraryState) => libraryState.nodes);

export const getWorkflowGraphEdges = createSelector(getGraphCommonState, (libraryState) => libraryState.edges);

export const getShouldResetView = createSelector(getGraphCommonState, (graphCommon) => graphCommon.shouldResetView);

const DEFAULT_COLOR = "#40464d";
const LIGHT_GREY = "#70767d";
const GREEN = "#4caf50";
const RED = "#f44336";

export const getWorkflowGraphEdgesColored = createSelector(getWorkflowGraphEdges, (edges) =>
  edges.map((edge) => {
    let color = DEFAULT_COLOR;

    if (edge.type === LOOPING_EDGE_TYPE) {
      color = LIGHT_GREY;
    } else {
      if (edge.data?.connect_on === true) {
        color = GREEN;
      } else if (edge.data?.connect_on === false) {
        color = RED;
      }
    }

    return {
      ...edge,
      style: {
        strokeWidth: 2,
        stroke: color,
      },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        width: 60,
        height: 8,
        color,
      },
    };
  })
);
