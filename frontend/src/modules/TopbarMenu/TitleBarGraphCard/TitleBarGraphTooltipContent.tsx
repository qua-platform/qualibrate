import React from "react";
import styles from "../styles/TitleBarTooltipContent.module.scss";
import { capitalize, formatDate, formatTime } from "../helpers";
import { useWebSocketData } from "../../../contexts/WebSocketContext";

const TitleBarGraphTooltipContent: React.FC = () => {
  const { runStatus } = useWebSocketData();

  return (
    <div className={styles.tooltipContent}>
      <div className={styles.tooltipRow}>
        <div className={styles.tooltipLabel}>Run start:</div>
        <div className={styles.tooltipValue}>{formatDate(runStatus?.graph?.run_start)}</div>
      </div>
      <div className={styles.tooltipRow}>
        <div className={styles.tooltipLabel}>Status:</div>
        <div className={styles.tooltipValue}>{capitalize(runStatus?.graph?.status ?? "pending")}</div>
      </div>
      <div className={styles.tooltipRow}>
        <div className={styles.tooltipLabel}>Run duration:</div>
        <div className={styles.tooltipValue}>{formatTime(runStatus?.graph?.run_duration ?? 0)}</div>
      </div>
      <div className={styles.tooltipRow}>
        <div className={styles.tooltipLabel}>Graph progress:</div>
        <div className={styles.tooltipValue}>
          {runStatus?.graph?.finished_nodes}/{runStatus?.graph?.total_nodes} nodes completed
        </div>
      </div>
    </div>
  );
};

export default TitleBarGraphTooltipContent;
