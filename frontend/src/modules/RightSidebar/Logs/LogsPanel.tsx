import React from "react";
import styles from "./styles/LogsPanel.module.scss";
import { formatDateTime } from "../../GraphLibrary/components/GraphStatus/components/MeasurementElement/MeasurementElement";
import { useRightSidePanelContext } from "../context/RightSidePanelContext";

export const LogsPanel = () => {
  const { logs } = useRightSidePanelContext();
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
