import React from "react";

interface LoadingBarProps {
  percentage: number;
  trackColor?: string;
  progressColor?: string;
  height?: number;
}

const LoadingBar: React.FC<LoadingBarProps> = ({
  percentage,
  trackColor = "#4E5058",
  progressColor = "#3CDEF8",
  height = 4,
}) => {
  const normalized = Math.max(0, Math.min(percentage, 100));

  return (
    <div style={{ width: "100%" }}>
      <svg viewBox="0 0 100 4" preserveAspectRatio="none" width="100%" height={height}>
        <rect
          x="0"
          y="0"
          width="100"
          height="4"
          rx={height / 2}
          ry={height / 2}
          fill={trackColor}
        />
        <rect
          x="0"
          y="0"
          width={normalized}
          height="4"
          rx={height / 2}
          ry={height / 2}
          fill={progressColor}
          style={{
            transition: "width 0.4s ease-in-out",
          }}
        />
      </svg>
    </div>
  );
};

export default LoadingBar;
