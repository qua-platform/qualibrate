import React from "react";
// eslint-disable-next-line css-modules/no-unused-class
import styles from "./RunningJob.module.scss";
import CheckmarkIcon from "../../../../ui-lib/Icons/CheckmarkIcon";
import ErrorIcon from "../../../../ui-lib/Icons/ErrorIcon";
import { StopIcon } from "../../../../ui-lib/Icons/StopIcon";

export const StatusLabel: React.FC<{ status?: string; percentage?: number; onStop?: () => void }> = ({ status, percentage = 0, onStop }) => {
  if (status === "finished") {
    return (<div className={styles.finishedText}>Finished <CheckmarkIcon height={38} width={38} /> </div>);
  } else if (status === "error") {
    return (<div className={styles.errorText}>Error <ErrorIcon height={30} width={30} /> </div>);
  } else if (status === "running") {
    return (
      <>
        <div className={styles.percentage}>{Math.round(percentage)}%</div>
        <button className={styles.stopButton} onClick={onStop} title="Stop Node"> <StopIcon /> </button>
      </>
    );
  } else {
    return null;
  }
};
