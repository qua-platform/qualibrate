import React, { createContext, PropsWithChildren, useContext, useEffect, useRef, useState } from "react";
import WebSocketService from "../services/WebSocketService";
import { WS_EXECUTION_HISTORY, WS_GET_STATUS } from "../services/webSocketRoutes";

type WebSocketData = {
  runStatus: unknown | null;
  history: unknown | null;
  sendRunStatus: (data: unknown) => void;
  sendHistory: (data: unknown) => void;
  subscribeToRunStatus: (cb: (data: unknown) => void) => void;
  unsubscribeFromRunStatus: (cb: (data: unknown) => void) => void;
  subscribeToHistory: (cb: (data: unknown) => void) => void;
  unsubscribeFromHistory: (cb: (data: unknown) => void) => void;
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
  const protocol = process.env.WS_PROTOCOL || "ws";
  const host = process.env.WS_BASE_URL || "localhost:8001";
  const runStatusWS = useRef<WebSocketService | null>(null);
  const historyWS = useRef<WebSocketService | null>(null);
  const [runStatus, setRunStatus] = useState<unknown | null>(null);
  const [history, setHistory] = useState<unknown | null>(null);

  useEffect(() => {
    const runStatusUrl = `${protocol}://${host}${WS_GET_STATUS}`;
    const historyUrl = `${protocol}://${host}${WS_EXECUTION_HISTORY}`;
    console.log(runStatusUrl);
    console.log(historyUrl);

    runStatusWS.current = new WebSocketService(runStatusUrl, setRunStatus);
    historyWS.current = new WebSocketService(historyUrl, setHistory);

    runStatusWS.current?.connect();
    historyWS.current?.connect();

    return () => {
      runStatusWS.current?.disconnect();
      historyWS.current?.disconnect();
    };
  }, []);

  const sendRunStatus = (data: unknown) => runStatusWS.current?.send(data);
  const sendHistory = (data: unknown) => historyWS.current?.send(data);

  const subscribeToRunStatus = (cb: (data: unknown) => void) => runStatusWS.current?.subscribe(cb);
  const unsubscribeFromRunStatus = (cb: (data: unknown) => void) => runStatusWS.current?.unsubscribe(cb);

  const subscribeToHistory = (cb: (data: unknown) => void) => historyWS.current?.subscribe(cb);
  const unsubscribeFromHistory = (cb: (data: unknown) => void) => historyWS.current?.unsubscribe(cb);

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
