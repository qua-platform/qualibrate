import { useEffect, useRef } from "react";
import {
  handleHideConnectionErrorDialog,
  handleSetRunStatus,
  handleShowConnectionErrorDialog,
  setConnectionLostSeconds,
  setHistory,
  setSnapshotInfo,
} from "./actions";
import { useRootDispatch } from "../index";
import { useSelector } from "react-redux";
import { getConnectionLostAt, getShowConnectionErrorDialog } from "./selectors";
import { setAllMeasurements } from "../GraphStores/GraphStatus";
import { HistoryType, RunStatusType, SnapshotType } from "./WebSocketStore";
import { WS_EXECUTION_HISTORY, WS_GET_STATUS, WS_SNAPSHOT_INFO } from "../../services/webSocketRoutes";
import WebSocketService from "../../services/WebSocketService";

export const useInitWebSocket = () => {
  const dispatch = useRootDispatch();
  const showConnectionErrorDialog = useSelector(getShowConnectionErrorDialog);
  const connectionLostAt = useSelector(getConnectionLostAt);

  const runStatusWS = useRef<WebSocketService<RunStatusType> | null>(null);
  const historyWS = useRef<WebSocketService<HistoryType> | null>(null);
  const snapshotInfoWS = useRef<WebSocketService<SnapshotType> | null>(null);

  const flattenHistory = (history: HistoryType) => {
    if (!history?.items) return [];

    return history.items.flatMap((item) => {
      if (item.elements_history?.items) {
        return [...item.elements_history.items].reverse();
      }
      return [item];
    });
  };

  useEffect(() => {
    if (!showConnectionErrorDialog || connectionLostAt === null) {
      return;
    }

    dispatch(setConnectionLostSeconds(Math.floor((Date.now() - connectionLostAt) / 1000)));
    const intervalId = window.setInterval(() => {
      dispatch(setConnectionLostSeconds(Math.floor((Date.now() - connectionLostAt) / 1000)));
    }, 1000);

    return () => {
      clearInterval(intervalId);
    };
  }, [showConnectionErrorDialog, connectionLostAt]);

  const handleSetHistory = (history: HistoryType) => {
    dispatch(setHistory(history));
    dispatch(setAllMeasurements(flattenHistory(history)));
  };

  // Establish WebSocket connections on mount, disconnect on unmount
  // Empty dependency array [] ensures this runs once per component lifecycle
  useEffect(() => {
    const protocol = window.location.protocol === "http:" ? "ws" : "wss";
    const location = process.env.WS_BASE_URL || `${window.location.host}${window.location.pathname}`;
    const host = process.env.WS_BASE_URL || location;
    const runStatusUrl = `${protocol}://${host}${WS_GET_STATUS}`;
    const historyUrl = `${protocol}://${host}${WS_EXECUTION_HISTORY}`;
    const snapshotInfoUrl = `${protocol}://${host}${WS_SNAPSHOT_INFO}`;

    runStatusWS.current = new WebSocketService<RunStatusType>(
      runStatusUrl,
      (runStatus) => dispatch(handleSetRunStatus(runStatus)),
      () => dispatch(handleHideConnectionErrorDialog()),
      () => dispatch(handleShowConnectionErrorDialog())
    );
    historyWS.current = new WebSocketService<HistoryType>(
      historyUrl,
      handleSetHistory,
      () => dispatch(handleHideConnectionErrorDialog()),
      () => dispatch(handleShowConnectionErrorDialog())
    );
    snapshotInfoWS.current = new WebSocketService<SnapshotType>(
      snapshotInfoUrl,
      (snapshotInfo) => dispatch(setSnapshotInfo(snapshotInfo)),
      () => dispatch(handleHideConnectionErrorDialog()),
      () => dispatch(handleShowConnectionErrorDialog())
    );

    if (runStatusWS.current && !runStatusWS.current.isConnected()) {
      runStatusWS.current.connect();
    }
    if (historyWS.current && !historyWS.current.isConnected()) {
      historyWS.current.connect();
    }
    if (snapshotInfoWS.current && !snapshotInfoWS.current.isConnected()) {
      snapshotInfoWS.current.connect();
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
      if (snapshotInfoWS.current && snapshotInfoWS.current.isConnected()) {
        snapshotInfoWS.current.disconnect();
      }
    };
  }, []);

  // Methods for sending data through WebSocket.
  const sendRunStatus = (data: RunStatusType) => runStatusWS.current?.send(data);
  const sendHistory = (data: HistoryType) => historyWS.current?.send(data);
  const sendSnapshotInfo = (data: SnapshotType) => snapshotInfoWS.current?.send(data);

  return {
    sendRunStatus,
    sendHistory,
    sendSnapshotInfo,
  };
};
