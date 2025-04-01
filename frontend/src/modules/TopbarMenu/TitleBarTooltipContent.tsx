import React from "react";
import styles from "./styles/TitleBarTooltipContent.module.scss";
import { LastRunStatusNodeResponseDTO } from "./TitleBarMenu";
import { formatDate } from "../Nodes/components/NodeElement/NodeElement";

interface TooltipContentProps {
  node: LastRunStatusNodeResponseDTO;
}

export const TitleBarTooltipContent: React.FC<TooltipContentProps> = ({ node }) => {
  return (
    <div className={styles.tooltipContent}>
      <div className={styles.tooltipRow}>
        <div className={styles.tooltipLabel}>Run start:</div>
        <div className={styles.tooltipValue}>{node.run_start ? formatDate(new Date(node.run_start)) : "—"}</div>
      </div>
      <div className={styles.tooltipRow}>
        <div className={styles.tooltipLabel}>Status:</div>
        <div className={styles.tooltipValue}>{node.status}</div>
      </div>
      <div className={styles.tooltipRow}>
        <div className={styles.tooltipLabel}>Run duration:</div>
        <div className={styles.tooltipValue}>{Math.floor(node.run_duration ?? 0)}s</div>
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
