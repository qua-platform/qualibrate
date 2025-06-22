import React from "react";
import styles from "../styles/TitleBarTooltipContent.module.scss";
import { LastRunStatusGraphResponseDTO } from "../constants";
import { formatDate, formatTime, capitalize } from "../helpers";

interface GraphTooltipContentProps {
  graph: LastRunStatusGraphResponseDTO;
}

const TitleBarGraphTooltipContent: React.FC<GraphTooltipContentProps> = ({ graph }) => {
  return (
    <div className={styles.tooltipContent}>
      <div className={styles.tooltipRow}>
        <div className={styles.tooltipLabel}>Run start:</div>
        <div className={styles.tooltipValue}>
          {formatDate(graph.run_start)}
        </div>
      </div>
      <div className={styles.tooltipRow}>
        <div className={styles.tooltipLabel}>Status:</div>
        <div className={styles.tooltipValue}>{capitalize(graph.status)}</div>
      </div>
      <div className={styles.tooltipRow}>
        <div className={styles.tooltipLabel}>Run duration:</div>
        <div className={styles.tooltipValue}>{formatTime(graph.run_duration ?? 0)}</div>
      </div>
      <div className={styles.tooltipRow}>
        <div className={styles.tooltipLabel}>Graph progress:</div>
        <div className={styles.tooltipValue}>
          {graph.finished_nodes}/{graph.total_nodes} nodes completed
        </div>
      </div>
    </div>
  );
};

export default TitleBarGraphTooltipContent;
