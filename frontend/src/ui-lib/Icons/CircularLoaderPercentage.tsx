import React from "react";

interface CircularLoaderPercentageProps {
  percentage?: number;
  color?: string;
  width?: number;
  height?: number;
}

const CircularLoaderPercentage: React.FC<CircularLoaderPercentageProps> = ({
  percentage = 0,
  color = "#3CDEF8",
  width = 30,
  height = 30,
}) => {
  const normalizedPercentage = Math.max(0, Math.min(percentage, 100));
  const radius = 14;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - normalizedPercentage / 100);

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      viewBox="0 0 30 30"
      fill="none"
    >
      {/* Base Hollow Track */}
      <circle
        cx="15"
        cy="15"
        r="14"
        stroke="#42424C"
        strokeWidth="1"
        fill="none"
      />
      {/* Progress Loader */}
      <circle
        cx="15"
        cy="15"
        r="14"
        stroke={color}
        strokeWidth="1.8"
        fill="none"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        style={{
          transition: "stroke-dashoffset 0.5s ease-in-out",
          transform: "rotate(-90deg)",
          transformOrigin: "50% 50%",
        }}
      />
      <text
        x="50%"
        y="52%"
        textAnchor="middle"
        dominantBaseline="middle"
        fill={color}
        fontFamily="Roboto, sans-serif"
        fontSize="9px"
        fontWeight="700"
      >
        {Math.round(normalizedPercentage)}%
      </text>
    </svg>
  );
};

export default CircularLoaderPercentage;
