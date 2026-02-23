import { createSelector } from "@reduxjs/toolkit";
import { RootState } from "../index";

export const getNodesState = (state: RootState) => state.nodes;

export const getSubmitNodeResponseError = createSelector(
  getNodesState,
  (state) => state.submitNodeResponseError
);

export const getSelectedNodeId = createSelector(
  getNodesState,
  (state) => state.selectedNode
);

export const getIsNodeSelected = createSelector(
  getNodesState,
  (state, nodeKey: string) => nodeKey,
  (state, nodeKey) => state.selectedNode === nodeKey
);

export const getRunningNode = createSelector(
  getNodesState,
  (state) => state.runningNode
);

export const getRunningNodeInfo = createSelector(
  getNodesState,
  (state) => state.runningNodeInfo
);

export const getLastRunNodeName = createSelector(
  getRunningNodeInfo,
  (runningNode) => runningNode?.lastRunNodeName
);

export const getAllNodes = createSelector(
  getNodesState,
  (state) => state.allNodes
);

export const getSelectedNode = createSelector(
  getAllNodes,
  getSelectedNodeId,
  (nodes = {}, selectedNodeId = "") => nodes[selectedNodeId]
);

export const getNode = createSelector(
  getAllNodes,
  (_, nodeKey: string) => nodeKey,
  (allNodes, key) => allNodes[key],
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

