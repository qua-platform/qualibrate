import React, {useEffect, useState} from "react";
// eslint-disable-next-line css-modules/no-unused-class
import styles from "./RunningJob.module.scss";
import { useNodesContext } from "../../context/NodesContext";
import { StateUpdates } from "../StateUpdates/StateUpdates";
import { RunningJobNodeProgressTracker } from "./RunningJobNodeProgressTracker";
import { RunningJobParameters } from "./RunningJobParameters";
import { NodesApi } from "../../api/NodesAPI";

export const RunningJob: React.FC = () => {
  const {
    runningNodeInfo,
    setRunningNodeInfo,
    updateAllButtonPressed,
    setUpdateAllButtonPressed,
    lastRunStatusNode,
  } = useNodesContext();

  return (
    <div className={styles.wrapper} data-testid="running-job-wrapper">
      {lastRunStatusNode?.status !== "pending" && <RunningJobNodeProgressTracker />}
      <div className={styles.parameterStatesWrapper}>
        <div className={styles.parameterColumnWrapper}>
          <RunningJobParameters />
        </div>
        <div className={styles.statesColumnWrapper} data-testid="states-column-wrapper">
          <StateUpdates
            runningNodeInfo={runningNodeInfo}
            setRunningNodeInfo={setRunningNodeInfo}
            updateAllButtonPressed={updateAllButtonPressed}
            setUpdateAllButtonPressed={setUpdateAllButtonPressed}
          />
        </div>
      </div>
    </div>
  );
};
