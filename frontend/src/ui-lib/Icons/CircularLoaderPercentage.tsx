import React from "react";
import { IconProps } from "../../common/interfaces/IconProps";

interface CircularLoaderPercentageProps extends IconProps {
  percentage: number;
}

const CircularLoader: React.FC<CircularLoaderPercentageProps> = ({ color, width = 50, height = 50, percentage }) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={width} height={height} fill="none" viewBox="0 0 27 27">
      <path stroke={color || "#80E1FF"} strokeLinecap="round" strokeWidth="1.6" d="M3.922 13.306a9.455 9.455 0 109.455-9.454">
        <animateTransform
          attributeName="transform"
          type="rotate"
          from="0 13.5 13.5"
          to="360 13.5 13.5"
          dur="0.8s"
          repeatCount="indefinite"
        />
      </path>

      <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" fill="#80E1FF" fontSize="8px" fontWeight="bold">
        {percentage}%
      </text>
    </svg>
  );
};

export default CircularLoader;
