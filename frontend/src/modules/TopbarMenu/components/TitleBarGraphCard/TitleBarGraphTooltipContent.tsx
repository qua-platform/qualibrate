import React from "react";
import { useSelector } from "react-redux";
import styles from "./styles/TitleBarTooltipContent.module.scss";
import { capitalize, formatDate, formatTime } from "../../helpers";
import {
  getRunStatusGraphFinishedNodes,
  getRunStatusGraphRunDuration,
  getRunStatusGraphRunStart,
  getRunStatusGraphStatus,
  getRunStatusGraphTotalNodes,
} from "../../../../stores/WebSocketStore";

const TitleBarGraphTooltipContent: React.FC = () => {
  const runStart = useSelector(getRunStatusGraphRunStart);
  const runStatusGraphStatus = useSelector(getRunStatusGraphStatus);
  const runDuration = useSelector(getRunStatusGraphRunDuration);
  const finishedNodes = useSelector(getRunStatusGraphFinishedNodes);
  const runStatusGraphTotalNodes = useSelector(getRunStatusGraphTotalNodes);

  return (
    <div className={styles.tooltipContent}>
      <div className={styles.tooltipRow}>
        <div className={styles.tooltipLabel}>Run start:</div>
        <div className={styles.tooltipValue}>{formatDate(runStart)}</div>
      </div>
      <div className={styles.tooltipRow}>
        <div className={styles.tooltipLabel}>Status:</div>
        <div className={styles.tooltipValue}>{capitalize(runStatusGraphStatus ?? "pending")}</div>
      </div>
      <div className={styles.tooltipRow}>
        <div className={styles.tooltipLabel}>Run duration:</div>
        <div className={styles.tooltipValue}>{formatTime(runDuration ?? 0)}</div>
      </div>
      <div className={styles.tooltipRow}>
        <div className={styles.tooltipLabel}>Graph progress:</div>
        <div className={styles.tooltipValue}>
          {finishedNodes}/{runStatusGraphTotalNodes} nodes completed
        </div>
      </div>
    </div>
  );
};

export default TitleBarGraphTooltipContent;
