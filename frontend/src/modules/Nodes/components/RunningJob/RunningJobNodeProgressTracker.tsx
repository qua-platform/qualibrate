import React from "react";
// eslint-disable-next-line css-modules/no-unused-class
import styles from "./RunningJob.module.scss";
import LoadingBar from "../../../../ui-lib/components/Bar/LoadingBar";
import { SnapshotsApi } from "../../../Snapshots/api/SnapshotsApi";
import { useNodesContext } from "../../context/NodesContext";
import { RunningJobStatusLabel } from "./RunningJobStatusLabel";
import { RunningJobStatusVisuals } from "./RunningJobStatusVisuals";

export const RunningJobNodeProgressTracker: React.FC = () => {
  const { setIsNodeRunning, lastRunStatusNode } = useNodesContext();

  const handleStopClick = async () => {
    const res = await SnapshotsApi.stopNodeRunning();
    if (res.isOk && res.result) {
      setIsNodeRunning(false);
    }
  };

  return (
    <div className={styles.jobInfoContainer}>
      <div className={styles.topRow}>
        <div className={styles.leftStatus}>
          <RunningJobStatusVisuals status={lastRunStatusNode?.status} percentage={Math.round(lastRunStatusNode?.percentage_complete ?? 0)} />
          <div className={styles.nodeText}>
            Node: <span className={styles.nodeName}>{lastRunStatusNode?.name || "Unnamed"}</span>
          </div>
        </div>
        <div className={styles.rightStatus}>
          <RunningJobStatusLabel status={lastRunStatusNode?.status} percentage={lastRunStatusNode?.percentage_complete} onStop={handleStopClick} />
        </div>
      </div>
      <div className={`${styles.loadingBarWrapper} ${styles[`bar_${lastRunStatusNode?.status}`]}`}>
        <LoadingBar percentage={Math.round(lastRunStatusNode?.percentage_complete ?? 0)} />
      </div>
    </div>
  );
};
