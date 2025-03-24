import React from "react";
// import styles from "./styles/TitleBarMenuCard.module.scss";
import styles from "./styles/TitleBarWorkflowCard.module.scss";
import TitleBarMenuCard from "./TitleBarMenuCard";
import { LastRunStatusNodeResponseDTO } from "./TitleBarMenu";
import CircularLoaderPercentage from "../../ui-lib/Icons/CircularLoaderPercentage";
import CheckmarkIcon from "../../ui-lib/Icons/CheckmarkIcon";
import ErrorIcon from "../../ui-lib/Icons/ErrorIcon";
import { classNames } from "../../utils/classnames";

const StatusIndicator: React.FC<{ status: string; percentage: number }> = ({ status, percentage }) => {
  return (
    <>
      {status === "Running" && <CircularLoaderPercentage percentage={percentage ?? 0} />}
      {status === "Finished" && <CheckmarkIcon />}
      {status === "Error" && <ErrorIcon />}
    </>
  );
};


interface LastRunStatusGraphResponseDTO {
  name: string;
  status: string;
  run_start: string;
  run_end: string;
  total_nodes: number;
  finished_nodes: number;
  run_duration: number;
  percentage_complete: number;
  time_remaining: number | null;
}

interface Props {
  graph: LastRunStatusGraphResponseDTO;
  node: LastRunStatusNodeResponseDTO;
}

const TitleBarWorkflowCard: React.FC<Props> = ({ graph, node }) => {
  const formatTime = (sec: number | null) => {
    if (sec === null) return "";
    const h = Math.floor(sec / 3600);
    const m = Math.floor(((sec % 3600) % 3600) / 60);
    const s = Math.floor(sec % 60);
    return `${h ? `${h}h ` : ""}${m ? `${m}m ` : ""}${s}s left`;
  };

  const isRunning = graph.status?.toLowerCase() === "running";
  const isFinished = graph.status?.toLowerCase() === "finished";
  const isError = graph.status?.toLowerCase() === "error";

  const wrapperClass = isRunning
    ? styles.running
    : isFinished
    ? styles.finished
    : isError
    ? styles.error
    : styles.idle;

  return (
    <div className={`${styles.workflowCardWrapper} ${wrapperClass}`}>
      <div className={styles.indicatorWrapper}>
        <StatusIndicator
          status={graph.status?.charAt(0).toUpperCase() + graph.status?.slice(1)}
          percentage={graph.percentage_complete ?? 0}
        />
      </div>
      <div className={styles.graphDetailsWrapper}>
        <div className={styles.textWrapper}>
          <div className={styles.graphTitle}>
            Active Graph: {graph.name || "No graph is running"}
          </div>
          <div className={styles.graphStatusRow}>
            <div className={classNames(styles.statusText, {
              [styles.statusRunning]: isRunning,
              [styles.statusFinished]: isFinished,
              [styles.statusError]: isError,
            })}>
              {graph.status}
            </div>
            <div className={styles.percentageText}>{graph.percentage_complete ?? 0}%</div>
            {graph.time_remaining !== null && (
              <div className={styles.timeRemaining}>{formatTime(graph.time_remaining)}</div>
            )}
          </div>
          <div className={styles.nodeCount}>
            {graph.finished_nodes}/{graph.total_nodes} nodes finished
          </div>
        </div>
      </div>
      <TitleBarMenuCard node={node} />
    </div>
  );
};

export default TitleBarWorkflowCard;
