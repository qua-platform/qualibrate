import { createSlice } from "@reduxjs/toolkit";
import { Measurement } from "../GraphStores/GraphStatus";
import {ErrorObject} from "../../components";

/**
 * Results from completed calibration node.
 * Available when NodeExecution.status is "finished" or "failed".
 */
export interface RunResults {
  parameters: Record<string, unknown>;
  outcomes: Record<string, unknown>;
  error: ErrorObject | null;
  initial_targets: unknown[];
  successful_targets: unknown[];
}

/**
 * Single calibration node execution state.
 * Updated via WebSocket every ~500ms during execution.
 * Time fields in seconds, timestamps in ISO format.
 */
export interface NodeExecution {
  current_action: string | null;
  description: string | null;
  id: number;
  name: string;
  parameters: Record<string, unknown>;
  percentage_complete: number;
  run_duration: number;
  run_end: string;
  run_start: string;
  status: "pending" | "running" | "finished" | "failed" | string;
  time_remaining: number;
  run_results: RunResults;
}

/**
 * Calibration graph workflow execution state (DAG of multiple nodes).
 * Tracks progress across entire multi-node workflow.
 *
 * @remarks
 * **FRAGILE: Type Inconsistency**:
 * run_start is typed as `string | Date` while run_end is `number`. This inconsistency
 * suggests potential runtime errors when comparing or formatting timestamps. Backend
 * may be sending different types at different stages. Consider standardizing to ISO strings.
 *
 * **Graph Execution Model**:
 * Graph execution orchestrates multiple NodeExecution instances. When runnable_type="graph",
 * this structure tracks overall workflow progress while individual node updates are still
 * pushed via NodeExecution messages.
 *
 */
export type GraphItem = {
  name: string;
  description: string;
  finished_nodes: number;
  total_nodes: number;
  run_start: string | Date;
  run_end: number;
  percentage_complete: number;
  run_duration: number;
  time_remaining: number;
  status: "pending" | "running" | "finished" | "failed";
  run_results?: RunResults
};

/**
 * Real-time calibration execution status.
 * Discriminated by runnable_type: "node" | "graph".
 *
 * @remarks
 * **Discriminated Union Pattern**:
 * Use runnable_type to determine which field (graph or node) contains valid data:
 * - When runnable_type="node": node is populated, graph is null
 * - When runnable_type="graph": graph is populated, node may still contain current node info
 */
export type RunStatusType = {
  is_running: boolean;
  graph: GraphItem | null;
  node: NodeExecution | null;
  runnable_type: "node" | "graph";
};

/**
 * Historical execution records for timeline visualization.
 *
 * Contains an array of past calibration measurements for displaying execution
 * history, trends, and comparisons in the timeline view.
 *
 * @remarks
 * Pushed via `/execution/ws/workflow_execution_history` WebSocket endpoint.
 * Used by timeline components to display calibration history and trends.
 */
export type HistoryType = {
  items: Measurement[];
};

/**
 * Real-time info about latest executed and latest saved snapshot id and a flag that indicates whether snapshots array
 * should be updated or not (by doing API request to the BE).
 *
 * @property saved_id - id of the last saved snapshot
 * @property latest_id - id of the last executed node
 * @property update_required -  flag that indicates if all snapshot array should be updated (because of the new ones)
 *
 * @remarks
 * Pushed via `/execution/ws/workflow_execution_history` WebSocket endpoint.
 * Used by timeline components to display calibration history and trends.
 *
 * @see Data for previous executed nodes details
 *
 */
export type SnapshotType = {
  saved_id: number;
  latest_id: number;
  update_required: boolean;
};

/**
 * WebSocket redux state interface providing real-time calibration data and operations.
 *
 * Provides access to two WebSocket streams (runStatus and history)
 *
 */
interface WebSocketState {
  runStatus: RunStatusType | null;
  history: HistoryType | null;
  snapshotInfo: SnapshotType | null;
  showConnectionErrorDialog: boolean;
  connectionLostAt: number | null;
  connectionLostSeconds: number;
}

const initialState: WebSocketState = {
  runStatus: null,
  history: null,
  snapshotInfo: null,
  showConnectionErrorDialog: false,
  connectionLostAt: null,
  connectionLostSeconds: 0,
};

export const webSocketSlice = createSlice({
  name: "webSocket",
  initialState,
  reducers: {
    setRunStatus: (state, action) => {
      state.runStatus = action.payload;
    },
    setHistory: (state, action) => {
      state.history = action.payload;
    },
    setSnapshotInfo: (state, action) => {
      state.snapshotInfo = action.payload;
    },
    setShowConnectionErrorDialog: (state, action) => {
      state.showConnectionErrorDialog = action.payload;
    },
    setConnectionLostAt: (state, action) => {
      state.connectionLostAt = action.payload;
    },
    setConnectionLostSeconds: (state, action) => {
      state.connectionLostSeconds = action.payload;
    },
  }
});

export default webSocketSlice.reducer;