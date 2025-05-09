import React, { useEffect, useState } from "react";
// eslint-disable-next-line css-modules/no-unused-class
import styles from "./RunningJob.module.scss";
import CircularLoaderProgress from "../../../../ui-lib/Icons/CircularLoaderProgress";
import LoadingBar from "../../../../ui-lib/Icons/LoadingBar";
import { StopIcon } from "../../../../ui-lib/Icons/StopIcon";
import CheckmarkIcon from "../../../../ui-lib/Icons/CheckmarkIcon";
import { SnapshotsApi } from "../../../Snapshots/api/SnapshotsApi";
import { NodesApi } from "../../../Nodes/api/NodesAPI";
import { useNodesContext } from "../../context/NodesContext";

export const RunningJobInfoSection: React.FC = () => {
  const [percentage, setPercentage] = useState(0);
  const [status, setStatus] = useState("");
  const [nodeName, setNodeName] = useState("");
  const { setIsNodeRunning } = useNodesContext();

  useEffect(() => {
    const fetchNodeInfo = async () => {
      const res = await NodesApi.fetchLastRunStatusInfo();
      if (res.isOk && res.result?.node) {
        const node = res.result.node;
        setPercentage(Math.round(node.percentage_complete ?? 0));
        setStatus(node.status?.toLowerCase() ?? "");
        setNodeName(node.name ?? "");
      }
    };

    fetchNodeInfo();
    const interval = setInterval(fetchNodeInfo, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleStopClick = () => {
    SnapshotsApi.stopNodeRunning().then((res) => {
      if (res.isOk) {
        setIsNodeRunning(!res.result);
      }
    });
  };

  const isRunning = status === "running";
  const isFinished = status === "finished";

  if (status === "pending") return null;

  return (
    <div className={styles.jobInfoContainer}>
      <div className={styles.topRow}>
        <div className={styles.leftStatus}>
          {isRunning && <CircularLoaderProgress percentage={percentage} />}
          {isFinished && <div className={styles.greenDot}></div>}
          <div className={styles.nodeText}>
            Node: <span className={styles.nodeName}>{nodeName}</span>
          </div>
        </div>
        <div className={styles.rightStatus}>
          {isRunning && (
            <>
              <div className={styles.percentage}>{percentage}%</div>
              <div className={styles.stopButton} onClick={handleStopClick}>
                <StopIcon />
              </div>
            </>
          )}
          {isFinished && (
            <>
              <div className={styles.finishedText}>Finished</div>
              <CheckmarkIcon />
            </>
          )}
        </div>
      </div>
      <div className={styles.loadingBarWrapper}>
        <LoadingBar
          percentage={percentage}
          progressColor={isFinished ? "#42AC4B" : "#3CDEF8"}
        />
      </div>
    </div>
  );
};
