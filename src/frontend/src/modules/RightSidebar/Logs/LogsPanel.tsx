import React, { useEffect, useRef, useState } from "react";
import styles from "./styles/LogsPanel.module.scss";
import { formatDateTime } from "../../../utils/formatDateTime";
import { LogsViewerResponseDTO } from "../../../stores/NodesStore";
import { WS_LOGS } from "../../../services/webSocketRoutes";
import WebSocketService from "../../../services/WebSocketService";
import { handleHideConnectionErrorDialog, handleShowConnectionErrorDialog } from "../../../stores/WebSocketStore";
import { useRootDispatch } from "../../../stores";

export const LogsPanel = () => {
  const [logs, setLogs] = useState<LogsViewerResponseDTO[]>([]);
  const logsWS = useRef<WebSocketService<LogsViewerResponseDTO> | null>(null);
  const dispatch = useRootDispatch();

  useEffect(() => {
    const protocol = window.location.protocol === "http:" ? "ws" : "wss";
    const host = process.env.WS_BASE_URL || location;
    const logsUrl = `${protocol}://${host}${WS_LOGS}`;

    logsWS.current = new WebSocketService<LogsViewerResponseDTO>(
      logsUrl,
      (logItem) => setLogs(prev => [logItem, ...prev]),
      () => dispatch(handleHideConnectionErrorDialog()),
      () => dispatch(handleShowConnectionErrorDialog())
    );

    if (logsWS.current && !logsWS.current.isConnected()) {
      logsWS.current.connect();
    }

    return () => {
      if (logsWS.current && logsWS.current.isConnected()) {
        logsWS.current.disconnect();
      }
    };
  }, []);

  return (
    <>
      <div className={styles.panelHeader}>
        <span className={styles.panelHeaderSpan}>LOGS</span>
      </div>
      <div className={styles.panelContent}>
        {logs.map((log, index) => {
          return (
            <div key={`${log.name}_${index}`}>
              <div className={styles.logsTimestamp}>{`${formatDateTime(log.asctime)} - ${log.name} - ${log.levelname}`}</div>
              <div className={styles.logsMessage}>
                {/*{` ${log.message}`}*/}
                {log.message?.split("\\n").map((item, idx) => {
                  return (
                    <span key={idx}>
                      {item}
                      <br />
                    </span>
                  );
                })}
                {log.exc_info ? <br /> : ""}
                {log.exc_info?.split("\\n").map((item, idx) => {
                  return (
                    <span key={idx}>
                      {item}
                      <br />
                    </span>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
};
