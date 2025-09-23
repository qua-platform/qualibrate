import React, { createContext, PropsWithChildren, useContext, useEffect, useRef, useState } from "react";
import WebSocketService from "../services/WebSocketService";
import { WS_EXECUTION_HISTORY, WS_GET_STATUS } from "../services/webSocketRoutes";
import { ErrorObject } from "../modules/common/Error/ErrorStatusWrapper";
import { Measurement } from "../modules/GraphLibrary/components/GraphStatus/context/GraphStatusContext";

export interface RunResults {
  parameters: Record<string, unknown>;
  outcomes: Record<string, unknown>;
  error: ErrorObject | null;
  initial_targets: unknown[];
  successful_targets: unknown[];
}

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

export type RunStatusType = {
  is_running: boolean;
  graph: GraphItem | null;
  node: NodeExecution | null;
  runnable_type: "node" | "graph";
};

export type HistoryType = {
  items: Measurement[];
};

type WebSocketData = {
  runStatus: RunStatusType | null;
  history: HistoryType | null;
  sendRunStatus: (data: RunStatusType) => void;
  sendHistory: (data: HistoryType) => void;
  subscribeToRunStatus: (cb: (data: RunStatusType) => void) => void;
  unsubscribeFromRunStatus: (cb: (data: RunStatusType) => void) => void;
  subscribeToHistory: (cb: (data: HistoryType) => void) => void;
  unsubscribeFromHistory: (cb: (data: HistoryType) => void) => void;
};

const WebSocketContext = createContext<WebSocketData>({
  runStatus: null,
  history: null,
  sendRunStatus: () => {},
  sendHistory: () => {},
  subscribeToRunStatus: () => {},
  unsubscribeFromRunStatus: () => {},
  subscribeToHistory: () => {},
  unsubscribeFromHistory: () => {},
});

export const useWebSocketData = () => useContext(WebSocketContext);

export const WebSocketProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const protocol = window.location.protocol === "http:" ? "ws" : "wss";
  const location = process.env.WS_BASE_URL || `${window.location.host}${window.location.pathname}`;
  const host = process.env.WS_BASE_URL || location;
  const runStatusWS = useRef<WebSocketService<RunStatusType> | null>(null);
  const historyWS = useRef<WebSocketService<HistoryType> | null>(null);
  const [runStatus, setRunStatus] = useState<RunStatusType | null>(null);
  const [history, setHistory] = useState<HistoryType | null>(null);

  useEffect(() => {
    const runStatusUrl = `${protocol}://${host}${WS_GET_STATUS}`;
    const historyUrl = `${protocol}://${host}${WS_EXECUTION_HISTORY}`;

    runStatusWS.current = new WebSocketService<RunStatusType>(runStatusUrl, setRunStatus);
    historyWS.current = new WebSocketService<HistoryType>(historyUrl, setHistory);

    if (runStatusWS.current) {
      runStatusWS.current.connect();
    }
    if (historyWS.current) {
      historyWS.current.connect();
    }

    return () => {
      if (runStatusWS.current) {
        runStatusWS.current.disconnect();
      }
      if (historyWS.current) {
        historyWS.current.disconnect();
      }
    };
  }, []);

  const sendRunStatus = (data: RunStatusType) => runStatusWS.current?.send(data);
  const sendHistory = (data: HistoryType) => historyWS.current?.send(data);

  const subscribeToRunStatus = (cb: (data: RunStatusType) => void) => runStatusWS.current?.subscribe(cb);
  const unsubscribeFromRunStatus = (cb: (data: RunStatusType) => void) => runStatusWS.current?.unsubscribe(cb);

  const subscribeToHistory = (cb: (data: HistoryType) => void) => historyWS.current?.subscribe(cb);
  const unsubscribeFromHistory = (cb: (data: HistoryType) => void) => historyWS.current?.unsubscribe(cb);

  return (
    <WebSocketContext.Provider
      value={{
        runStatus,
        history,
        sendRunStatus,
        sendHistory,
        subscribeToRunStatus,
        unsubscribeFromRunStatus,
        subscribeToHistory,
        unsubscribeFromHistory,
      }}
    >
      {children}
    </WebSocketContext.Provider>
  );
};
