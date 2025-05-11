import React, { useEffect, useState } from "react";
// eslint-disable-next-line css-modules/no-unused-class
import styles from "./RunningJob.module.scss";
import CircularLoaderProgress from "../../../../ui-lib/Icons/CircularLoaderProgress";
import LoadingBar from "../../../../ui-lib/Icons/LoadingBar";
import { StopIcon } from "../../../../ui-lib/Icons/StopIcon";
import CheckmarkIcon from "../../../../ui-lib/Icons/CheckmarkIcon";
import ErrorIcon from "../../../../ui-lib/Icons/ErrorIcon";
import { SnapshotsApi } from "../../../Snapshots/api/SnapshotsApi";
import { NodesApi } from "../../api/NodesAPI";
import { useNodesContext } from "../../context/NodesContext";

export const RunningJobNodeProgressTracker: React.FC = () => {
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

  const handleStopClick = async () => {
    const res = await SnapshotsApi.stopNodeRunning();
    if (res.isOk) {
      const checkRes = await NodesApi.checkIsNodeRunning();
      if (checkRes.isOk) {
        setIsNodeRunning(checkRes.result === true);
      }
    }
  };

  const isRunning = status === "running";
  const isFinished = status === "finished";
  const isError = status === "error";
  
  let dotElement = null;
  let barColor = "#3CDEF8";
  if (isRunning) {
    dotElement = <CircularLoaderProgress percentage={percentage} />;
  } else if (isFinished) {
    dotElement = <div className={styles.greenDot}></div>;
    barColor = "#00D59A";
  } else if (isError) {
    dotElement = <div className={styles.redDot}></div>;
    barColor = "#FF6173";
  }

  return (
    <div className={styles.jobInfoContainer}>
      <div className={styles.topRow}>
        <div className={styles.leftStatus}>
          {isRunning && <CircularLoaderProgress percentage={percentage} />}
          {!isRunning && dotElement}
          <div className={styles.nodeText}>
            Node: <span className={styles.nodeName}>{nodeName}</span>
          </div>
        </div>
        <div className={styles.rightStatus}>
          {isRunning && (
            <>
              <div className={styles.percentage}>{percentage}%</div>
              <div className={styles.stopButton} onClick={handleStopClick}> <StopIcon /> </div>
            </>
          )}
          {isFinished && (
              <div className={styles.finishedText}>Finished <CheckmarkIcon height={38} width={38} /> </div>
          )}          
          {isError && (
            <div className={styles.errorText}>Error<ErrorIcon height={32} width={32} /> </div>
          )}
        </div>
      </div>
      <div className={styles.loadingBarWrapper}>
        <LoadingBar
          percentage={percentage}
          progressColor={barColor}
        />
      </div>
    </div>
  );
};
