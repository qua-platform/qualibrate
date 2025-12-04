import { createSelector } from "@reduxjs/toolkit";
import { RootState } from "..";

export const getNodesState = (state: RootState) => state.nodes;

export const getSubmitNodeResponseError = createSelector(
  getNodesState,
  (state) => state.submitNodeResponseError
);

export const getSelectedNode = createSelector(
  getNodesState,
  (state) => state.selectedNode
);

export const getRunningNode = createSelector(
  getNodesState,
  (state) => state.runningNode
);

export const getRunningNodeInfo = createSelector(
  getNodesState,
  (state) => state.runningNodeInfo
);

export const getAllNodes = createSelector(
  getNodesState,
  (state) => state.allNodes
);

export const getIsNodeRunning = createSelector(
  getNodesState,
  (state) => state.isNodeRunning
);

export const getResults = createSelector(
  getNodesState,
  (state) => state.results
);

export const getIsAllStatusesUpdated = createSelector(
  getNodesState,
  (state) => state.isAllStatusesUpdated
);

export const getUpdateAllButtonPressed = createSelector(
  getNodesState,
  (state) => state.updateAllButtonPressed
);

export const getIsRescanningNodes = createSelector(
  getNodesState,
  (state) => state.isRescanningNodes
);

