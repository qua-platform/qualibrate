import React from "react";
import { useSelector } from "react-redux";
// eslint-disable-next-line css-modules/no-unused-class
import styles from "./RunningJob.module.scss";
import { StateUpdates } from "../StateUpdates/StateUpdates";
import { RunningJobNodeProgressTracker } from "./RunningJobNodeProgressTracker";
import { RunningJobParameters } from "./RunningJobParameters";
import { getRunStatusNodeStatus } from "../../../../stores/WebSocketStore";

export const RunningJob: React.FC = () => {
  const runNodeStatus = useSelector(getRunStatusNodeStatus);

  return (
    <div className={styles.wrapper} data-testid="running-job-wrapper">
      {runNodeStatus !== undefined && <RunningJobNodeProgressTracker />}
      <div className={styles.parameterStatesWrapper}>
        <div className={styles.parameterColumnWrapper}>
          <RunningJobParameters />
        </div>
        <div className={styles.statesColumnWrapper} data-testid="states-column-wrapper">
          <StateUpdates />
        </div>
      </div>
    </div>
  );
};
