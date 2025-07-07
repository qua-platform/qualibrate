import React from "react";
// eslint-disable-next-line css-modules/no-unused-class
import styles from "./RunningJob.module.scss";
import LoadingBar from "../../../../ui-lib/components/Bar/LoadingBar";
import { SnapshotsApi } from "../../../Snapshots/api/SnapshotsApi";
import { useNodesContext } from "../../context/NodesContext";
import { RunningJobStatusLabel } from "./RunningJobStatusLabel";
import { RunningJobStatusVisuals } from "./RunningJobStatusVisuals";

export const RunningJobNodeProgressTracker: React.FC = () => {
  const { setIsNodeRunning, runStatus } = useNodesContext();

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
          <RunningJobStatusVisuals status={runStatus?.node?.status} percentage={Math.round(runStatus?.node?.percentage_complete ?? 0)} />
          <div className={styles.nodeText}>
            Node: <span className={styles.nodeName}>{runStatus?.node?.name || "Unnamed"}</span>
          </div>
        </div>
        <div className={styles.rightStatus}>
          <RunningJobStatusLabel
            status={runStatus?.node?.status}
            percentage={runStatus?.node?.percentage_complete}
            onStop={handleStopClick}
          />
        </div>
      </div>
      <div className={`${styles.loadingBarWrapper} ${styles[`bar_${runStatus?.node?.status}`]}`}>
        <LoadingBar percentage={Math.round(runStatus?.node?.percentage_complete ?? 0)} />
      </div>
    </div>
  );
};
