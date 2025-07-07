import React from "react";
// eslint-disable-next-line css-modules/no-unused-class
import styles from "./RunningJob.module.scss";
import { useNodesContext } from "../../context/NodesContext";
import { StateUpdates } from "../StateUpdates/StateUpdates";
import { RunningJobNodeProgressTracker } from "./RunningJobNodeProgressTracker";
import { RunningJobParameters } from "./RunningJobParameters";

export const RunningJob: React.FC = () => {
  const { runningNodeInfo, setRunningNodeInfo, updateAllButtonPressed, setUpdateAllButtonPressed, runStatus } = useNodesContext();

  return (
    <div className={styles.wrapper} data-testid="running-job-wrapper">
      {runStatus?.node?.status !== undefined && <RunningJobNodeProgressTracker />}
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
