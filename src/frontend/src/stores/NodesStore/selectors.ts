import { createSelector } from "@reduxjs/toolkit";
import { RootState } from "../index";
import { getSearchStringIndex } from "../../utils";
import { NodeMap } from "../../modules/Nodes";
import { NodesListSortType } from "./NodesStore";

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

export const getNodeListSearchValue = createSelector(
  getNodesState,
  (nodesState) => nodesState.listSearchString
);

export const getNodeListSortType = createSelector(
  getNodesState,
  (nodesState) => nodesState.listSortType
);

export const getAllNodes = createSelector(
  getNodesState,
  getNodeListSearchValue,
  getNodeListSortType,
  getLastRunNodeName,
  (nodesState, listSearchString, listSortType, lastRunNodeName) => Object.entries(nodesState.allNodes || {})
    .filter(([key]) => listSearchString ? getSearchStringIndex(key, listSearchString) !== -1 : true)
    .sort(([aKey], [bKey]) => {
      switch (listSortType) {
        case NodesListSortType.Name:
          return aKey > bKey ? 1 : aKey < bKey ? -1 : 0;
        case NodesListSortType.LastRun:
        case NodesListSortType.Status:
          return aKey === lastRunNodeName ? -1 : 1;
        default:
          return 0;
      }
    })
    .reduce((acc, [key, value]) => {
      acc[key] = value;
      return acc;
    }, {} as NodeMap)
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

