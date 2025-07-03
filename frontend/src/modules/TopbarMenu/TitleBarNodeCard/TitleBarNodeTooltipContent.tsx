import React from "react";
import styles from "../styles/TitleBarTooltipContent.module.scss";
import { LastRunStatusNodeResponseDTO } from "../constants";
import { formatDate, formatTime, capitalize } from "../helpers";

interface TooltipContentProps {
  node: LastRunStatusNodeResponseDTO;
}

export const TitleBarTooltipContent: React.FC<TooltipContentProps> = ({ node }) => {
  return (
    <div className={styles.tooltipContent}>
      <div className={styles.tooltipRow}>
        <div className={styles.tooltipLabel}>Run start:</div>
        <div className={styles.tooltipValue}>{formatDate(node.run_start)}</div>
      </div>
      <div className={styles.tooltipRow}>
        <div className={styles.tooltipLabel}>Status:</div>
        <div className={styles.tooltipValue}>{capitalize(node.status)}</div>
      </div>
      <div className={styles.tooltipRow}>
        <div className={styles.tooltipLabel}>Run duration:</div>
        <div className={styles.tooltipValue}>{formatTime(node.run_duration ?? 0)}</div>
      </div>
      {node.id && node.id !== -1 && (
        <div className={styles.tooltipRow}>
          <div className={styles.tooltipLabel}>idx:</div>
          <div className={styles.tooltipValue}>{node.id}</div>
        </div>
      )}
    </div>
  );
};

export default TitleBarTooltipContent;
