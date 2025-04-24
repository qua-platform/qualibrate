import React from "react";
import styles from "./styles/TitleBarTooltipContent.module.scss";
import { LastRunStatusGraphResponseDTO } from "./TitleBarMenu";
import { formatDate } from "../Nodes/components/NodeElement/NodeElement";

interface GraphTooltipContentProps {
  graph: LastRunStatusGraphResponseDTO;
}

const formatTime = (sec: number | null) => {
  if (sec === null) return "";
  const h = Math.floor(sec / 3600);
  const m = Math.floor(((sec % 3600) % 3600) / 60);
  const s = Math.floor(sec % 60);
  return `${h ? `${h}h ` : ""}${m ? `${m}m ` : ""}${s}s left`;
};

const TitleBarGraphTooltipContent: React.FC<GraphTooltipContentProps> = ({ graph }) => {
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
