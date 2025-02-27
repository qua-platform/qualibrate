import { IconProps } from "../../common/interfaces/IconProps";
import React from "react";

export const InfoIcon: React.FunctionComponent<IconProps> = ({ width = 16, height = 16, color = "#A5ACB6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={width} height={height} viewBox="0 0 16 16" fill="none">
    <circle cx="8" cy="8" r="7" stroke={color} strokeWidth="1.5" fill="none"/>
    <text x="50%" y="70%" fontSize="9" fontWeight="bold" textAnchor="middle" fill={color} fontFamily="Arial, sans-serif">
      i
    </text>
  </svg>
);
