import React from "react";
import styles from "../styles/TitleBarTooltipContent.module.scss";
import { LastRunStatusNodeResponseDTO } from "../constants";
import { formatDate, capitalize } from "../helpers";

interface TooltipContentProps {
  node: LastRunStatusNodeResponseDTO;
}

const formatTime = (sec: number | null) => {
  if (sec === null) return "";
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = Math.floor(sec % 60);
  return `${h ? `${h}h ` : ""}${m ? `${m}m ` : ""}${s}s`;
};

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
