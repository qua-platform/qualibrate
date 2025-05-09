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

  const borderRadius = `${height ? height / 2 : 2}px`;

  return (
    <div
      style={{
        width: "100%",
        height: `${height}px`,
        backgroundColor: trackColor,
        borderRadius,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          width: `${normalized}%`,
          height: "100%",
          backgroundColor: progressColor,
          borderRadius,
          transition: "width 0.4s ease-in-out",
        }}
      />
    </div>
  );
};

export default LoadingBar;
