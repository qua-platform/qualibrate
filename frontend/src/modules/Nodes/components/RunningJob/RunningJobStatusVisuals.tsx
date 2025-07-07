import React from "react";
// eslint-disable-next-line css-modules/no-unused-class
import styles from "./RunningJob.module.scss";
import CircularLoaderProgress from "../../../../ui-lib/Icons/CircularLoaderProgress";

export const RunningJobStatusVisuals: React.FC<{ status?: string; percentage: number }> = ({ status = "pending", percentage }) => {
  if (status === "running") {
    return <CircularLoaderProgress percentage={percentage} />;
  } else if (status === "finished") {
    return <div className={styles.greenDot} />;
  } else if (status === "error") {
    return <div className={styles.redDot} />;
  }
  
  return <div className={styles.greyDot} />;
};
