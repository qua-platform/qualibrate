import React from "react";

interface CircularLoaderPercentageProps {
  percentage: number;
  color?: string;
  width?: number;
  height?: number;
}

const CircularLoaderPercentage: React.FC<CircularLoaderPercentageProps> = ({
  color = "#80E1FF",
  width = 50,
  height = 50,
  percentage = 0,
}) => {
  const radius = 12;
  const circumference = 2 * Math.PI * radius;
  const progressOffset = circumference * ((100 - percentage) / 100);

  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={width} height={height} viewBox="0 0 30 30">
      {/* Background Circle */}
      <circle
        cx="15"
        cy="15"
        r={radius}
        stroke="#1E2A38" /* Dark background stroke */
        strokeWidth="3"
        fill="none"
      />
      
      {/* Progress Arc */}
      <circle
        cx="15"
        cy="15"
        r={radius}
        stroke={color}
        strokeWidth="3"
        fill="none"
        strokeDasharray={circumference}
        strokeDashoffset={progressOffset} /* Dynamic progress */
        strokeLinecap="round"
        transform="rotate(-90 15 15)" /* Rotates start point to top */
        style={{
          transition: "stroke-dashoffset 0.5s ease-in-out", // Smooth transition
        }}
      />

      {/* Percentage Text */}
      <text
        x="50%"
        y="50%"
        dominantBaseline="middle"
        textAnchor="middle"
        fill={color}
        fontSize="8px"
        fontWeight="bold"
      >
        {percentage}%
      </text>
    </svg>
  );
};

export default CircularLoaderPercentage;
