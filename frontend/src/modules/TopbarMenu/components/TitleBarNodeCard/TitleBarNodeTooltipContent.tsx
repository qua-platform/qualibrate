import React from "react";
import { useSelector } from "react-redux";
import styles from "./styles/TitleBarTooltipContent.module.scss";
import { capitalize, formatDate, formatTime } from "../../helpers";
import { getRunStatusNode } from "../../../../stores/WebSocketStore";

export const TitleBarTooltipContent: React.FC = () => {
  const runStatusNode = useSelector(getRunStatusNode);

  return (
    <div className={styles.tooltipContent}>
      <div className={styles.tooltipRow}>
        <div className={styles.tooltipLabel}>Run start:</div>
        <div className={styles.tooltipValue}>{formatDate(runStatusNode?.run_start)}</div>
      </div>
      <div className={styles.tooltipRow}>
        <div className={styles.tooltipLabel}>Status:</div>
        <div className={styles.tooltipValue}>{capitalize(runStatusNode?.status ?? "")}</div>
      </div>
      <div className={styles.tooltipRow}>
        <div className={styles.tooltipLabel}>Run duration:</div>
        <div className={styles.tooltipValue}>{formatTime(runStatusNode?.run_duration ?? 0)}</div>
      </div>
      {runStatusNode?.id && runStatusNode?.id !== -1 && (
        <div className={styles.tooltipRow}>
          <div className={styles.tooltipLabel}>idx:</div>
          <div className={styles.tooltipValue}>{runStatusNode?.id}</div>
        </div>
      )}
    </div>
  );
};
