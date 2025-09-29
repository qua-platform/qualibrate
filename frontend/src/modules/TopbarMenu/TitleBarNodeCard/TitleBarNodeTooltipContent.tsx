import React from "react";
import styles from "../styles/TitleBarTooltipContent.module.scss";
import { capitalize, formatDate, formatTime } from "../helpers";
import { useWebSocketData } from "../../../contexts/WebSocketContext";

export const TitleBarTooltipContent: React.FC = () => {
  const { runStatus } = useWebSocketData();

  return (
    <div className={styles.tooltipContent}>
      <div className={styles.tooltipRow}>
        <div className={styles.tooltipLabel}>Run start:</div>
        <div className={styles.tooltipValue}>{formatDate(runStatus?.node?.run_start)}</div>
      </div>
      <div className={styles.tooltipRow}>
        <div className={styles.tooltipLabel}>Status:</div>
        <div className={styles.tooltipValue}>{capitalize(runStatus?.node?.status ?? "")}</div>
      </div>
      <div className={styles.tooltipRow}>
        <div className={styles.tooltipLabel}>Run duration:</div>
        <div className={styles.tooltipValue}>{formatTime(runStatus?.node?.run_duration ?? 0)}</div>
      </div>
      {runStatus?.node?.id && runStatus?.node?.id !== -1 && (
        <div className={styles.tooltipRow}>
          <div className={styles.tooltipLabel}>idx:</div>
          <div className={styles.tooltipValue}>{runStatus?.node?.id}</div>
        </div>
      )}
    </div>
  );
};

export default TitleBarTooltipContent;
