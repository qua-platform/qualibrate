import React from "react";
import styles from "./styles/TitleBarTooltipContent.module.scss";
import { LastRunStatusGraphResponseDTO } from "./TitleBarMenu";
import { formatDate } from "../Nodes/components/NodeElement/NodeElement";

interface WorkflowTooltipContentProps {
  graph: LastRunStatusGraphResponseDTO;
}

const TitleBarWorkflowTooltipContent: React.FC<WorkflowTooltipContentProps> = ({ graph }) => {
  return (
    <div className={styles.tooltipContent}>
      <div className={styles.tooltipRow}>
        <div className={styles.tooltipLabel}>Run start:</div>
        <div className={styles.tooltipValue}>
          {graph.run_start ? formatDate(new Date(graph.run_start)) : "—"}
        </div>
      </div>
      <div className={styles.tooltipRow}>
        <div className={styles.tooltipLabel}>Status:</div>
        <div className={styles.tooltipValue}>{graph.status}</div>
      </div>
      <div className={styles.tooltipRow}>
        <div className={styles.tooltipLabel}>Run duration:</div>
        <div className={styles.tooltipValue}>{Math.floor(graph.run_duration ?? 0)}s</div>
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

export default TitleBarWorkflowTooltipContent;
