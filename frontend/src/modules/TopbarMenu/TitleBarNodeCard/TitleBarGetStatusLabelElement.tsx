import React from "react";
/* eslint-disable css-modules/no-unused-class */
import styles from "./styles/TitleBarNodeCard.module.scss";
import { classNames } from "../../../utils/classnames";

export const getStatusLabelElement = (status: string | undefined, currentAction?: string): React.ReactNode => {
  const normalizedStatus = status?.toLowerCase();
  if (normalizedStatus === "running") {
    return (
      <div className={classNames(styles.statusContainer, styles.statusRunning)}>
        Running
        <span className={styles.statusRunningValue}>{currentAction ? `: ${currentAction}` : ""}</span>
      </div>
    );
  }
  if (normalizedStatus === "finished") {
    return <div className={classNames(styles.statusContainer, styles.statusFinished)}>Finished</div>;
  }
  if (normalizedStatus === "error") {
    return <div className={classNames(styles.statusContainer, styles.statusError)}>Error</div>;
  }
  return <div className={classNames(styles.statusContainer, styles.statusPending)}>Select and Run Node</div>;
};
