import React from "react";
import { useSelector } from "react-redux";
import styles from "../styles/TitleBarTooltipContent.module.scss";
import { capitalize, formatDate, formatTime } from "../helpers";
import { getRunStatusGraph } from "../../../stores/WebSocketStore/selectors";

const TitleBarGraphTooltipContent: React.FC = () => {
  const runStatusGraph = useSelector(getRunStatusGraph);

  return (
    <div className={styles.tooltipContent}>
      <div className={styles.tooltipRow}>
        <div className={styles.tooltipLabel}>Run start:</div>
        <div className={styles.tooltipValue}>{formatDate(runStatusGraph?.run_start)}</div>
      </div>
      <div className={styles.tooltipRow}>
        <div className={styles.tooltipLabel}>Status:</div>
        <div className={styles.tooltipValue}>{capitalize(runStatusGraph?.status ?? "pending")}</div>
      </div>
      <div className={styles.tooltipRow}>
        <div className={styles.tooltipLabel}>Run duration:</div>
        <div className={styles.tooltipValue}>{formatTime(runStatusGraph?.run_duration ?? 0)}</div>
      </div>
      <div className={styles.tooltipRow}>
        <div className={styles.tooltipLabel}>Graph progress:</div>
        <div className={styles.tooltipValue}>
          {runStatusGraph?.finished_nodes}/{runStatusGraph?.total_nodes} nodes completed
        </div>
      </div>
    </div>
  );
};

export default TitleBarGraphTooltipContent;
