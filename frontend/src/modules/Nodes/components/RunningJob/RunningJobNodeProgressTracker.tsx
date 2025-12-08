import React from "react";
import { useSelector } from "react-redux";
// eslint-disable-next-line css-modules/no-unused-class
import styles from "./RunningJob.module.scss";
import { CircularLoadingBar } from "../../../../components";
import { SnapshotsApi } from "../../../../stores/SnapshotsStore";
import { RunningJobStatusLabel } from "./RunningJobStatusLabel";
import { RunningJobStatusVisuals } from "./RunningJobStatusVisuals";
import { setIsNodeRunning } from "../../../../stores/NodesStore";
import { useRootDispatch } from "../../../../stores";
import { getRunStatusNodeName, getRunStatusNodePercentage, getRunStatusNodeStatus } from "../../../../stores/WebSocketStore";

export const RunningJobNodeProgressTracker: React.FC = () => {
  const dispatch = useRootDispatch();
  const runNodeName = useSelector(getRunStatusNodeName);
  const runNodeStatus = useSelector(getRunStatusNodeStatus);
  const runNodePercentage = useSelector(getRunStatusNodePercentage);

  const handleStopClick = async () => {
    const res = await SnapshotsApi.stopNodeRunning();
    if (res.isOk && res.result) {
      dispatch(setIsNodeRunning(false));
    }
  };

  return (
    <div className={styles.jobInfoContainer}>
      <div className={styles.topRow}>
        <div className={styles.leftStatus}>
          <RunningJobStatusVisuals status={runNodeStatus} percentage={Math.round(runNodePercentage ?? 0)} />
          <div className={styles.nodeText}>
            Node: <span className={styles.nodeName}>{runNodeName || "Unnamed"}</span>
          </div>
        </div>
        <div className={styles.rightStatus}>
          <RunningJobStatusLabel
            status={runNodeStatus}
            percentage={runNodePercentage}
            onStop={handleStopClick}
          />
        </div>
      </div>
      <div className={`${styles.loadingBarWrapper} ${styles[`bar_${runNodeStatus}`]}`}>
        <CircularLoadingBar percentage={Math.round(runNodePercentage ?? 0)} />
      </div>
    </div>
  );
};
