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
  width = 50,
  height = 50,
}) => {
  const radius = 12;
  const circumference = 2 * Math.PI * radius;
  const progressOffset = circumference * ((100 - percentage) / 100);

  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={width} height={height} viewBox="0 0 30 30">
      {/* Base Hollow Track */}
      <circle cx="15" cy="15" r={radius} stroke="#42424C" strokeWidth="1" fill="none" />
      {/* Progress Loader */}
      <circle
        cx="15"
        cy="15"
        r={radius}
        stroke={color}
        strokeWidth="1.8"
        fill="none"
        strokeDasharray={circumference}
        strokeDashoffset={progressOffset}
        strokeLinecap="round"
        transform="rotate(-90 15 15)"
        style={{
          transition: "stroke-dashoffset 0.5s ease-in-out",
        }}
      />
      {/* Percentage Text */}
      <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" fill={color} fontSize="8px" fontWeight="bold">
        {Math.round(Math.max(0, Math.min(percentage, 100)))}%
      </text>
    </svg>
  );
};

export default CircularLoaderPercentage;
