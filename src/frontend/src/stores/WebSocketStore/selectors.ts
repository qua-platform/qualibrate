import { createSelector } from "@reduxjs/toolkit";
import { RootState } from "../index";

export const getWebSocketState = (state: RootState) => state.webSocket;

export const getRunStatus = createSelector(
  getWebSocketState,
  (webSocketState) => webSocketState.runStatus
);

export const getHistory = createSelector(
  getWebSocketState,
  (webSocketState) => webSocketState.history
);

export const getShowConnectionErrorDialog = createSelector(
  getWebSocketState,
  (webSocketState) => webSocketState.showConnectionErrorDialog
);

export const getConnectionLostAt = createSelector(
  getWebSocketState,
  (webSocketState) => webSocketState.connectionLostAt
);

export const getConnectionLostSeconds = createSelector(
  getWebSocketState,
  (webSocketState) => webSocketState.connectionLostSeconds
);

/**
 * runStatus selectors
 */

export const getRunStatusIsRunning = createSelector(
  getRunStatus,
  (runStatusState) => runStatusState?.is_running
);

export const getRunStatusType = createSelector(
  getRunStatus,
  (runStatusState) => runStatusState?.runnable_type
);

export const getRunResultNodeError = createSelector(
  getRunStatus,
  (runStatusState) => runStatusState?.node?.run_results?.error
);

/**
 * graph selectors
 */

export const getRunStatusGraph = createSelector(
  getRunStatus,
  (runStatusState) => runStatusState?.graph
);

export const getRunStatusGraphName = createSelector(
  getRunStatusGraph,
  (runStatusGraphState) => runStatusGraphState?.name
);

export const getRunStatusGraphTotalNodes = createSelector(
  getRunStatusGraph,
  (runStatusGraphState) => runStatusGraphState?.total_nodes
);

export const getRunStatusGraphStatus = createSelector(
  getRunStatusGraph,
  (runStatusGraphState) => runStatusGraphState?.status
);

export const getRunStatusGraphPercentageComplete = createSelector(
  getRunStatusGraph,
  (runStatusGraphState) => runStatusGraphState?.percentage_complete
);

export const getRunStatusGraphFinishedNodes = createSelector(
  getRunStatusGraph,
  (runStatusGraphState) => runStatusGraphState?.finished_nodes
);

export const getRunStatusGraphTimeRemaining = createSelector(
  getRunStatusGraph,
  (runStatusGraphState) => runStatusGraphState?.time_remaining
);

export const getRunStatusGraphRunStart = createSelector(
  getRunStatusGraph,
  (runStatusGraphState) => runStatusGraphState?.run_start
);

export const getRunStatusGraphRunDuration = createSelector(
  getRunStatusGraph,
  (runStatusGraphState) => runStatusGraphState?.run_duration
);

export const getRunStatusGraphError = createSelector(
  getRunStatusGraph,
  (runStatusGraphState) => runStatusGraphState?.run_results?.error
);

/**
 * runStatus Node selectors
 */

export const getRunStatusNode = createSelector(
  getRunStatus,
  (runStatusState) => runStatusState?.node
);

export const getRunStatusNodeName = createSelector(
  getRunStatusNode,
  (runStatusNodeState) => runStatusNodeState?.name
);

export const getIsLastRunNode = createSelector(
  getRunStatusNodeName,
  (runStatusNodeName, nodeKey: string) => nodeKey,
  (runStatusNodeName, nodeKey) => runStatusNodeName === nodeKey
);

export const getRunStatusNodeStatus = createSelector(
  getRunStatusNode,
  (runStatusNodeState) => runStatusNodeState?.status
);

export const getRunStatusNodeRunDuration = createSelector(
  getRunStatusNode,
  (runStatusNodeState) => runStatusNodeState?.run_duration
);

export const getRunStatusNodePercentage = createSelector(
  getRunStatusNode,
  (runStatusNodeState) => runStatusNodeState?.percentage_complete
);

export const getRunStatusNodeId = createSelector(
  getRunStatusNode,
  (runStatusNodeState) => runStatusNodeState?.id
);

export const getRunStatusNodeCurrentAction = createSelector(
  getRunStatusNode,
  (runStatusNodeState) => runStatusNodeState?.current_action
);

export const getRunStatusNodeTimeRemaining = createSelector(
  getRunStatusNode,
  (runStatusNodeState) => runStatusNodeState?.time_remaining
);

/**
 * snapshotInfo selectors
 */

export const getSnapshotInfo = createSelector(
  getWebSocketState,
  (webSocketState) => webSocketState.snapshotInfo,
);

export const getIsSnapshotUpdateRequired = createSelector(
  getSnapshotInfo,
  (snapshotInfo) => snapshotInfo?.update_required
);
