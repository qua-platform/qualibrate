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
  const { setIsNodeRunning, lastRunStatusNode } = useNodesContext();

  const handleStopClick = async () => {
    const res = await SnapshotsApi.stopNodeRunning();
    if (res.isOk) {
      const checkRes = await NodesApi.checkIsNodeRunning();
      if (checkRes.isOk) {
        setIsNodeRunning(checkRes.result === true);
      }
    }
  };

  const isRunning = lastRunStatusNode?.status === "running";
  const isFinished = lastRunStatusNode?.status === "finished";
  const isError = lastRunStatusNode?.status === "error";
  
  let dotElement = null;
  let barColor = "#3CDEF8";
  if (isRunning) {
    dotElement = <CircularLoaderProgress percentage={(Math.round(lastRunStatusNode?.percentage_complete ?? 0))} />;
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
          {isRunning && <CircularLoaderProgress percentage={(Math.round(lastRunStatusNode?.percentage_complete ?? 0))} />}
          {!isRunning && dotElement}
          <div className={styles.nodeText}>
            Node: <span className={styles.nodeName}>{lastRunStatusNode?.name}</span>
          </div>
        </div>
        <div className={styles.rightStatus}>
          {isRunning && (
            <>
              <div className={styles.percentage}>{(Math.round(lastRunStatusNode?.percentage_complete ?? 0))}%</div>
              <button className={styles.stopButton} onClick={handleStopClick}> <StopIcon /> </button>
            </>
          )}
          {isFinished && (<div className={styles.finishedText}>Finished <CheckmarkIcon height={38} width={38} /> </div>)}          
          {isError && (<div className={styles.errorText}>Error<ErrorIcon height={32} width={32} /> </div>)}
        </div>
      </div>
      <div className={styles.loadingBarWrapper}>
        <LoadingBar
          percentage={(Math.round(lastRunStatusNode?.percentage_complete ?? 0))}
          progressColor={barColor}
        />
      </div>
    </div>
  );
};
