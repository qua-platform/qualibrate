/**
 * @fileoverview Visual status indicators for calibration node execution state.
 *
 * Renders status-specific UI elements: progress spinner for running nodes,
 * colored dots for completed/error/pending states.
 */
import React from "react";
// eslint-disable-next-line css-modules/no-unused-class
import styles from "./NodeElement.module.scss";
import CircularLoaderProgress from "../../../../components/Icons/CircularLoaderProgress";

/**
 * Render status indicator based on calibration execution state.
 *
 * Visual mapping:
 * - running: Circular progress spinner with percentage
 * - finished: Green dot
 * - error: Red dot
 * - pending: Grey dot (default)
 *
 * @param status - Execution status from WebSocket updates
 * @param percentage - Progress percentage (0-100) for running state
 */
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
