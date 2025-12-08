import React, { useEffect, useState } from "react";
import styles from "./styles/LogsPanel.module.scss";
import { formatDateTime } from "../../../utils/formatDateTime";
import { LogsViewerResponseDTO, NodesApi } from "../../../stores/NodesStore";

export const LogsPanel = () => {
  const [logs, setLogs] = useState<LogsViewerResponseDTO[]>([]);

  const checkNewLogs = async () => {
    const maxNumberOfLogs: number = 300;
    const after = logs.length > 0 ? logs[logs.length - 1]?.asctime : null;
    const response = await NodesApi.getLogs(after, null, maxNumberOfLogs.toString());

    if (response.isOk && response.result) {
      const newLogs = response.result;
      if (newLogs.length === maxNumberOfLogs) {
        setLogs(newLogs);
      } else if (newLogs.length > 0) {
        const updatedLogs = [...newLogs, ...logs].slice(0, maxNumberOfLogs);
        setLogs(updatedLogs);
      }
    }
  };

  useEffect(() => {
    const checkInterval = setInterval(async () => checkNewLogs(), 1000);
    return () => clearInterval(checkInterval);
  }, [logs]);

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
