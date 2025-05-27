import React from "react";
// eslint-disable-next-line css-modules/no-unused-class
import styles from "./RunningJob.module.scss";
import CircularLoaderProgress from "../../../../ui-lib/Icons/CircularLoaderProgress";
import LoadingBar from "../../../../ui-lib/components/Bar/LoadingBar";
import { StopIcon } from "../../../../ui-lib/Icons/StopIcon";
import CheckmarkIcon from "../../../../ui-lib/Icons/CheckmarkIcon";
import ErrorIcon from "../../../../ui-lib/Icons/ErrorIcon";
import { SnapshotsApi } from "../../../Snapshots/api/SnapshotsApi";
import { NodesApi } from "../../api/NodesAPI";
import { useNodesContext } from "../../context/NodesContext";
import { classNames } from "../../../../utils/classnames";

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

  const statusClassMap: Record<string, string> = {
    finished: styles.greenDot,
    error:    styles.redDot,
    pending:  styles.greyDot,
  };

  const barColorMap: Record<string, string> = {
    running:  "#3CDEF8",
    finished: "#00D59A",
    error:    "#FF6173",
    pending:  "#3CDEF8",
  };

  const dotElement = lastRunStatusNode?.status === "running"
    ? <CircularLoaderProgress percentage={Math.round(lastRunStatusNode?.percentage_complete ?? 0)} />
    : <div className={classNames(statusClassMap[lastRunStatusNode?.status ?? "pending"])} />;

  return (
    <div className={styles.jobInfoContainer}>
      <div className={styles.topRow}>
        <div className={styles.leftStatus}>
          {dotElement}
          <div className={styles.nodeText}>
            Node: <span className={styles.nodeName}>{lastRunStatusNode?.name}</span>
          </div>
        </div>
        <div className={styles.rightStatus}>
          {lastRunStatusNode?.status === "running" && (
            <>
              <div className={styles.percentage}>{Math.round(lastRunStatusNode?.percentage_complete ?? 0)}%</div>
              <button className={styles.stopButton} onClick={handleStopClick} title="Stop Node"> <StopIcon /> </button>
            </>
          )}
          {lastRunStatusNode?.status === "finished" && (
            <div className={styles.finishedText}>Finished <CheckmarkIcon height={38} width={38} /> </div>
          )}
          {lastRunStatusNode?.status === "error" && (
            <div className={styles.errorText}>Error <ErrorIcon height={30} width={30} /> </div>
          )}
        </div>
      </div>
      <div className={styles.loadingBarWrapper}>
        <LoadingBar
          percentage={Math.round(lastRunStatusNode?.percentage_complete ?? 0)} 
          progressColor={barColorMap[lastRunStatusNode?.status ?? "pending"]} 
        />
      </div>
    </div>
  );
};
