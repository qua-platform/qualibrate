import React from "react";

interface StopButtonIconProps {
  className?: string;
  width?: number;
  height?: number;
}

const StopButtonIcon: React.FC<StopButtonIconProps> = ({
  className,
  width = 80,
  height = 32,
}) => {
  return (
    <svg
      className={className}
      width={width}
      height={height}
      viewBox="0 0 80 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Outer rounded border */}
      <rect
        x="1"
        y="1"
        width="78"
        height="30"
        rx="15"
        stroke="#FF5586"
        strokeOpacity="0.4"
        strokeWidth="2"
        fill="none"
      />

      {/* Inner stop square */}
      <rect x="16" y="11" width="10" height="10" rx="2" fill="#FF5586" />

      {/* STOP text */}
      <text
        x="32"
        y="21.5"
        fill="#FF5586"
        fontSize="14"
        fontWeight="bold"
        fontFamily="Roboto, sans-serif"
      >
        STOP
      </text>
    </svg>
  );
};

export default StopButtonIcon;
