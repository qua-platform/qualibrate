/**
 * @fileoverview Styling helper for NodeElement based on execution status.
 *
 * Determines CSS classes for node rows to visually indicate selection state
 * and calibration execution status (pending, running, finished, error).
 */
// eslint-disable-next-line css-modules/no-unused-class
import styles from "./NodeElement.module.scss";

/**
 * Compute CSS class names for node row based on selection and execution status.
 *
 * Status precedence: running > error > finished > pending.
 * Applies different visual styles for each status to provide clear user feedback.
 *
 * @param nodeName - Name of this node
 * @param selectedItemName - Currently selected node in UI
 * @param runStatus - Current execution status from WebSocket (null if no active run)
 * @returns Space-separated CSS class names for styling
 */
export const getNodeRowClass = ({
  isSelected,
  isLastRun,
  runStatus,
}: {
  isSelected: boolean;
  isLastRun: boolean;
  runStatus?: string;
}): string => {
  const nodeStatus = (isLastRun && runStatus) ? runStatus : "pending";

  // Visual priority: finished > error > running > pending
  if (isLastRun && nodeStatus === "finished") {
    return `${styles.rowWrapper} ${styles.nodeSelectedFinished}`;
  } else if (isLastRun && nodeStatus === "error") {
    return `${styles.rowWrapper} ${styles.nodeSelectedError}`;
  } else if (isLastRun && nodeStatus === "running") {
    return `${styles.rowWrapper} ${styles.nodeSelectedRunning} ${styles.highlightRunningRow}`;
  } else if (isSelected && nodeStatus === "pending") {
    return `${styles.rowWrapper} ${styles.nodeSelectedPending}`;
  }

  return styles.rowWrapper;
};
