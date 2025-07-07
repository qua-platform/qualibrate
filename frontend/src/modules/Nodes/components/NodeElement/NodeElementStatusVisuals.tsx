import React from "react";
// eslint-disable-next-line css-modules/no-unused-class
import styles from "./NodeElement.module.scss";
import CircularLoaderProgress from "../../../../ui-lib/Icons/CircularLoaderProgress";

export const StatusVisuals: React.FC<{ status?: string; percentage: number }> = ({ status = "pending", percentage }) => {
  if (status === "running") {
    return <CircularLoaderProgress percentage={percentage ?? 0} />;
  } else if (status === "finished") {
    return <div className={`${styles.dot} ${styles.greenDot}`} />;
  } else if (status === "error") {
    return <div className={`${styles.dot} ${styles.redDot}`} />;
  }

  return <div className={`${styles.dot} ${styles.greyDot}`} />;
};
