/**
 * @fileoverview WebSocket state for real-time calibration updates.
 *
 * Provides two connections: run status and execution history.
 * Auto-reconnects every second on failure.
 *
 * **Architecture**:
 * - Uses singleton WebSocketService instances per connection (stored in useRef)
 * - Auto-reconnects once per second until the server becomes available again
 * - Supports pub/sub pattern with subscribe/unsubscribe for multiple consumers
 * - Updates pushed to state every ~500ms during active calibration runs
 *
 * @see WebSocketService
 * @see NodesContext
 */

import React, {createContext, PropsWithChildren, useCallback, useContext, useEffect, useRef, useState} from "react";
import WebSocketService from "../services/WebSocketService";
import {WS_EXECUTION_HISTORY, WS_GET_STATUS} from "../services/webSocketRoutes";
import {ErrorObject} from "../modules/common/Error/ErrorStatusWrapper";
import {Measurement} from "../modules/GraphLibrary/components/GraphStatus/context/GraphStatusContext";
import {BasicDialog} from "../common/ui-components/common/BasicDialog/BasicDialog";
import {useProjectContext} from "../modules/Project/context/ProjectContext";

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
  error?: ErrorObject;
  status: "pending" | "running" | "finished" | "failed";
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
 * WebSocket context value interface providing real-time calibration data and operations.
 *
 * Provides access to two WebSocket streams (runStatus and history) along with
 * methods for sending data and subscribing to updates via pub/sub pattern.
 *
 */
type WebSocketData = {
  runStatus: RunStatusType | null;
  history: HistoryType | null;
  sendRunStatus: (data: RunStatusType) => void;
  sendHistory: (data: HistoryType) => void;
  subscribeToRunStatus: (cb: (data: RunStatusType) => void) => () => void;
  subscribeToHistory: (cb: (data: HistoryType) => void) => () => void;
};

const WebSocketContext = createContext<WebSocketData>({
  runStatus: null,
  history: null,
  sendRunStatus: () => {},
  sendHistory: () => {},
  subscribeToRunStatus: () => () => {},
  subscribeToHistory: () => () => {},
});

export const useWebSocketData = () => useContext(WebSocketContext);

/**
 * WebSocket provider for real-time calibration data.
 * Manages two connections: run status and execution history.
 * Place high in component tree (in index.tsx).
 */
export const WebSocketProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const protocol = window.location.protocol === "http:" ? "ws" : "wss";
  const location = process.env.WS_BASE_URL || `${window.location.host}${window.location.pathname}`;
  const host = process.env.WS_BASE_URL || location;
  // Use useRef to persist WebSocketService instances across re-renders
  // This prevents reconnection on every component update
  const runStatusWS = useRef<WebSocketService<RunStatusType> | null>(null);
  const historyWS = useRef<WebSocketService<HistoryType> | null>(null);

  const [runStatus, setRunStatus] = useState<RunStatusType | null>(null);
  const [history, setHistory] = useState<HistoryType | null>(null);
  const [showConnectionErrorDialog, setShowConnectionErrorDialog] = useState<boolean>(false);
  const [connectionLostAt, setConnectionLostAt] = useState<number | null>(null);
  const [connectionLostSeconds, setConnectionLostSeconds] = useState<number>(0);
  const connectionLostAtRef = useRef<number | null>(null);
  const { refreshShouldGoToProjectPage } = useProjectContext();

  const handleShowConnectionErrorDialog = useCallback(() => {
    if (localStorage.getItem("backandWorking") !== "true") {
      return;
    }

    if (connectionLostAtRef.current === null) {
      const now = Date.now();
      connectionLostAtRef.current = now;
      setConnectionLostAt(now);
      setConnectionLostSeconds(0);
    }
    setShowConnectionErrorDialog(true);
    localStorage.setItem("backandWorking", "false");
  }, []);

  const handleHideConnectionErrorDialog = useCallback(() => {
    setShowConnectionErrorDialog((isVisible) => {
      if (!isVisible) {
        return isVisible;
      }
      localStorage.setItem("backandWorking", "true");
      connectionLostAtRef.current = null;
      setConnectionLostAt(null);
      setConnectionLostSeconds(0);
      void refreshShouldGoToProjectPage();
      return false;
    });
  }, [refreshShouldGoToProjectPage]);

  useEffect(() => {
    if (!showConnectionErrorDialog || connectionLostAt === null) {
      return;
    }
    setConnectionLostSeconds(Math.floor((Date.now() - connectionLostAt) / 1000));
    const intervalId = window.setInterval(() => {
      setConnectionLostSeconds(Math.floor((Date.now() - connectionLostAt) / 1000));
    }, 1000);

    return () => {
      clearInterval(intervalId);
    };
  }, [showConnectionErrorDialog, connectionLostAt]);

  const formatElapsed = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return minutes > 0 ? `${minutes}m ${secs.toString().padStart(2, "0")}s` : `${secs}s`;
  };

  // Establish WebSocket connections on mount, disconnect on unmount
  // Empty dependency array [] ensures this runs once per component lifecycle
  useEffect(() => {
    const runStatusUrl = `${protocol}://${host}${WS_GET_STATUS}`;
    const historyUrl = `${protocol}://${host}${WS_EXECUTION_HISTORY}`;

    runStatusWS.current = new WebSocketService<RunStatusType>(
      runStatusUrl,
      setRunStatus,
      handleHideConnectionErrorDialog,
      handleShowConnectionErrorDialog
    );
    historyWS.current = new WebSocketService<HistoryType>(
      historyUrl,
      setHistory,
      handleHideConnectionErrorDialog,
      handleShowConnectionErrorDialog
    );

    if (runStatusWS.current && !runStatusWS.current.isConnected()) {
      runStatusWS.current.connect();
    }
    if (historyWS.current && !historyWS.current.isConnected()) {
      historyWS.current.connect();
    }

    // Cleanup function: disconnect WebSockets when component unmounts
    // Prevents memory leaks and dangling connections
    return () => {
      if (runStatusWS.current && runStatusWS.current.isConnected()) {
        runStatusWS.current.disconnect();
      }
      if (historyWS.current && historyWS.current.isConnected()) {
        historyWS.current.disconnect();
      }
    };
  }, []);

  const sendRunStatus = (data: RunStatusType) => runStatusWS.current?.send(data);
  const sendHistory = (data: HistoryType) => historyWS.current?.send(data);

  const subscribeToRunStatus = (cb: (data: RunStatusType) => void) => {
    return runStatusWS.current?.subscribe(cb) ?? (() => {});
  };

  const subscribeToHistory = (cb: (data: HistoryType) => void) => {
    return historyWS.current?.subscribe(cb) ?? (() => {});
  };

  return (
    <WebSocketContext.Provider
      value={{
        runStatus,
        history,
        sendRunStatus,
        sendHistory,
        subscribeToRunStatus,
        subscribeToHistory,
      }}
    >
      {showConnectionErrorDialog && (
        <BasicDialog
          open={showConnectionErrorDialog}
          title={"Connection lost"}
          description={
            <>
              Connection with the server has been lost.
              <br />
              Retrying for {formatElapsed(connectionLostSeconds)}...
            </>
          }
        />
      )}
      {children}
    </WebSocketContext.Provider>
  );
};
