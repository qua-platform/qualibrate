import React from "react";
import styles from "./LoadingBar.module.scss";

interface LoadingBarProps {
  percentage: number;
  trackColor?: string;
  progressColor?: string;
  height?: number;
}

const LoadingBar: React.FC<LoadingBarProps> = ({
  percentage,
  trackColor = "#4E5058",
  progressColor,
  height = 4,
}) => {
  const normalized = Math.max(0, Math.min(percentage, 100));
  const viewBoxWidth = 1000;
  const progressWidth = (normalized / 100) * viewBoxWidth;
  const rx = height / 2;

  return (
    <svg
      width="100%"
      height={height}
      viewBox={`0 0 ${viewBoxWidth} ${height}`}
      preserveAspectRatio="none"
    >
      <rect
        x={0}
        y={0}
        width={viewBoxWidth}
        height={height}
        rx={rx}
        fill={trackColor}
      />

      <rect
        className={styles.progress}
        x={0}
        y={0}
        width={progressWidth}
        height={height}
        rx={rx}
        fill={progressColor || "var(--progress-color)"}
      />
    </svg>
  );
};

export default LoadingBar;
