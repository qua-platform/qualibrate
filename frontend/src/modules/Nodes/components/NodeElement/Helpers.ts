// eslint-disable-next-line css-modules/no-unused-class
import styles from "./NodeElement.module.scss";

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
    return `${styles.rowWrapper} ${styles.nodeSelectedRunning} ${styles.highlightRunningRow}`;
  } else if (isSelected && nodeStatus === "pending") {
    return `${styles.rowWrapper} ${styles.nodeSelectedPending}`;
  } else {
    return styles.rowWrapper;
  }
};
