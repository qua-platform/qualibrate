import React from "react";
// eslint-disable-next-line css-modules/no-unused-class
import styles from "./styles/TitleBarMenuCard.module.scss";
import { LastRunStatusNodeResponseDTO } from "./TitleBarMenu";

const formatDate = (isoString: string | null | undefined) => {
  if (!isoString) return "-";
  const date = new Date(isoString);
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  };
  return date.toLocaleString("en-US", options).replace(",", "");
};

interface TooltipContentProps {
  node: LastRunStatusNodeResponseDTO;
}

export const TitleBarTooltipContent: React.FC<TooltipContentProps> = ({ node }) => {
  return (
    <div className={styles.tooltipContent}>
      <div className={styles.tooltipRow}>
        <span className={styles.tooltipLabel}>Run start:</span>
        <span className={styles.tooltipValue}>{formatDate(node.run_start)}</span>
      </div>
      <div className={styles.tooltipRow}>
        <span className={styles.tooltipLabel}>Status:</span>
        <span className={styles.tooltipValue}>{node.status}</span>
      </div>
      <div className={styles.tooltipRow}>
        <span className={styles.tooltipLabel}>Run duration:</span>
        <span className={styles.tooltipValue}>{Math.floor(node.run_duration ?? 0)}s</span>
      </div>
      <div className={styles.tooltipRow}>
        <span className={styles.tooltipLabel}>idx:</span>
        <span className={styles.tooltipValue}>{node.id}</span>
      </div>
    </div>
  );
};

export default TitleBarTooltipContent;
