import React from "react";
import styles from "./RunningJob.module.scss";
import CircularLoaderProgress from "../../../../ui-lib/Icons/CircularLoaderProgress";

export const StatusVisuals: React.FC<{ status?: string; percentage: number }> = ({ status = "pending", percentage }) => {
  if (status === "running") {
    return <CircularLoaderProgress percentage={percentage} />;
  } else if (status === "finished") {
    return <div className={styles.greenDot} />;
  } else if (status === "error") {
    return <div className={styles.redDot} />;
  } else {
    return <div className={styles.greyDot} />;
  }
};
