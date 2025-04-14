import React from "react";
import styles from "./styles/LogsPanel.module.scss";
import { useLogsContext } from "./context/LogsContext";
import { formatDateTime } from "../../GraphLibrary/components/GraphStatus/components/MeasurementElement/MeasurementElement";

export const LogsPanel = () => {
  const { logs } = useLogsContext();
  return (
    <>
      <div className={styles.panelHeader}>
        <span>LOGS</span>
      </div>
      <div className={styles.panelContent}>
        {/*{logs && logs.length && logs[0].message}*/}
        {logs.map((log) => {
          return (
            <>
              <div className={styles.logsTimestamp}>{`${formatDateTime(log.asctime)} >`}</div>
              <div className={styles.logsMessage}>{` ${log.message}`}</div>
            </>
          );
        })}
      </div>
    </>
  );
};
