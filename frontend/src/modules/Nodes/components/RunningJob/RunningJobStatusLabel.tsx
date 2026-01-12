import React from "react";
// eslint-disable-next-line css-modules/no-unused-class
import styles from "./RunningJob.module.scss";
import { CheckmarkIcon, ErrorIcon, StopIcon } from "../../../../components";

export const RunningJobStatusLabel: React.FC<{ status?: string; percentage?: number; onStop?: () => void }> = ({ status, percentage = 0, onStop }) => {
  if (status === "finished") {
    return (<div className={styles.finishedText}>Finished <CheckmarkIcon height={30} width={30} /> </div>);
  } else if (status === "error") {
    return (<div className={styles.errorText}>Error <ErrorIcon height={22} width={22} /> </div>);
  } else if (status === "running") {
    return (
      <>
        <div className={styles.percentage}>{Math.round(percentage)}%</div>
        <button className={styles.stopButton} onClick={onStop} title="Stop Node"> <StopIcon /> </button>
      </>
    );
  }
  
  return null;
};
