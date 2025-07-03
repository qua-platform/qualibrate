import React from "react";

interface Props {
  className?: string;
  width?: number;
  height?: number;
}

const StopButtonIcon: React.FC<Props> = ({ className, height = 24 }) => {
  return (
    <svg className={className} height={height} viewBox="0 0 42 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Outer rounded border */}
      <rect
        x="0.5"
        y="0.5"
        width="41"
        height="17"
        rx="8"
        stroke="#FF5586"
        strokeOpacity="0.4"
        strokeWidth="1" ///* <--- thinner stroke */
        fill="none"
      />

      {/* Inner stop square */}
      <rect x="6" y="6" width="6" height="6" rx="0.5" fill="#FF5586" />

      {/* STOP text */}
      <text
        x="16"
        y="12"
        fill="#FF5586"
        fontSize="8"
        fontWeight="500"
        fontFamily="Roboto, sans-serif"
        textAnchor="start"
        dominantBaseline="center"
      >
        STOP
      </text>
    </svg>
  );
};

export default StopButtonIcon;
