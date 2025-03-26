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
    second: "2-digit",
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
        <div className={styles.tooltipLabel}>Run start:</div>
        <div className={styles.tooltipValue}>{formatDate(node.run_start)}</div>
      </div>
      <div className={styles.tooltipRow}>
        <div className={styles.tooltipLabel}>Status:</div>
        <div className={styles.tooltipValue}>{node.status}</div>
      </div>
      <div className={styles.tooltipRow}>
        <div className={styles.tooltipLabel}>Run duration:</div>
        <div className={styles.tooltipValue}>{Math.floor(node.run_duration ?? 0)}s</div>
      </div>
      <div className={styles.tooltipRow}>
        <div className={styles.tooltipLabel}>idx:</div>
        <div className={styles.tooltipValue}>{node.id}</div>
      </div>
    </div>
  );
};

export default TitleBarTooltipContent;
