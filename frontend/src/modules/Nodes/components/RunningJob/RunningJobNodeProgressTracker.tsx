import React from "react";
// eslint-disable-next-line css-modules/no-unused-class
import styles from "./RunningJob.module.scss";
import CircularLoaderProgress from "../../../../ui-lib/Icons/CircularLoaderProgress";
import LoadingBar from "../../../../ui-lib/components/Bar/LoadingBar";
import { StopIcon } from "../../../../ui-lib/Icons/StopIcon";
import CheckmarkIcon from "../../../../ui-lib/Icons/CheckmarkIcon";
import ErrorIcon from "../../../../ui-lib/Icons/ErrorIcon";
import { SnapshotsApi } from "../../../Snapshots/api/SnapshotsApi";
import { useNodesContext } from "../../context/NodesContext";

const StatusVisuals: React.FC<{ status?: string; percentage: number }> = ({ status = "pending", percentage }) => {
  if (status === "running") {
    return <CircularLoaderProgress percentage={percentage} />;
  } else if (status === "finished") {
    return <div className={styles.greenDot} />;
  } else if (status === "error") {
    return <div className={styles.redDot} />;
  } else {
    return <div className={styles.greyDot} />;
  }
};

const StatusLabel: React.FC<{ status?: string; percentage?: number; onStop?: () => void }> = ({ status, percentage = 0, onStop }) => {
  if (status === "finished") {
    return (<div className={styles.finishedText}>Finished <CheckmarkIcon height={38} width={38} /> </div>);
  } else if (status === "error") {
    return (<div className={styles.errorText}>Error <ErrorIcon height={30} width={30} /> </div>);
  } else if (status === "running") {
    return (
      <>
        <div className={styles.percentage}>{Math.round(percentage)}%</div>
        <button className={styles.stopButton} onClick={onStop} title="Stop Node"> <StopIcon /> </button>
      </>
    );
  } else {
    return null;
  }
};

export const RunningJobNodeProgressTracker: React.FC = () => {
  const { setIsNodeRunning, lastRunStatusNode } = useNodesContext();

  const handleStopClick = async () => {
    const res = await SnapshotsApi.stopNodeRunning();
    if (res.isOk) setIsNodeRunning(false);
  };

  return (
    <div className={styles.jobInfoContainer}>
      <div className={styles.topRow}>
        <div className={styles.leftStatus}>
          <StatusVisuals status={lastRunStatusNode?.status} percentage={Math.round(lastRunStatusNode?.percentage_complete ?? 0)} />
          <div className={styles.nodeText}>
            Node: <span className={styles.nodeName}>{lastRunStatusNode?.name || "Unnamed"}</span>
          </div>
        </div>
        <div className={styles.rightStatus}>
          <StatusLabel status={lastRunStatusNode?.status} percentage={lastRunStatusNode?.percentage_complete} onStop={handleStopClick} />
        </div>
      </div>
      <div className={`${styles.loadingBarWrapper} ${styles[`bar_${lastRunStatusNode?.status}`]}`}>
        <LoadingBar percentage={Math.round(lastRunStatusNode?.percentage_complete ?? 0)} />
      </div>
    </div>
  );
};
