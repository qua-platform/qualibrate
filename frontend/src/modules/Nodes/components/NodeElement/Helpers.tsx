import React from "react";
import styles from "./NodeElement.module.scss";
import CircularLoaderProgress from "../../../../ui-lib/Icons/CircularLoaderProgress";

export const StatusVisuals: React.FC<{ status?: string; percentage: number }> = ({ status = "pending", percentage }) => {
  if (status === "running") {
    return <CircularLoaderProgress percentage={percentage} />;
  } else if (status === "finished") {
    return <div className={`${styles.dot} ${styles.greenDot}`} />;
  } else if (status === "error") {
    return <div className={`${styles.dot} ${styles.redDot}`} />;
  } else {
    return <div className={`${styles.dot} ${styles.greyDot}`} />;
  }
};

export const getNodeRowClass = ({
  nodeName,
  selectedItemName,
  lastRunStatusNode,
}: {
  nodeName: string;
  selectedItemName: string;
  lastRunStatusNode: { name?: string; status?: string } | null;
}): string => {
  const isSelected = selectedItemName === nodeName;
  const isLastRun = lastRunStatusNode?.name === nodeName;
  const nodeStatus = isLastRun ? lastRunStatusNode?.status : "pending";

  if (isLastRun && nodeStatus === "finished") {
    return `${styles.rowWrapper} ${styles.nodeSelectedFinished}`;
  } else if (isLastRun && nodeStatus === "error") {
    return `${styles.rowWrapper} ${styles.nodeSelectedError}`;
  } else if (isLastRun && nodeStatus === "running") {
    return `${styles.rowWrapper} ${styles.nodeSelectedRunning} ${styles.rowWrapperRunning}`;
  } else if (isSelected && nodeStatus === "pending") {
    return `${styles.rowWrapper} ${styles.nodeSelectedPending}`;
  } else {
    return styles.rowWrapper;
  }
};
