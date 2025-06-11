import React from "react";
// eslint-disable-next-line css-modules/no-unused-class
import styles from "./RunningJob.module.scss";
import LoadingBar from "../../../../ui-lib/components/Bar/LoadingBar";
import { SnapshotsApi } from "../../../Snapshots/api/SnapshotsApi";
import { useNodesContext } from "../../context/NodesContext";
import { StatusVisuals, StatusLabel } from "./Helpers";

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
