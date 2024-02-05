import { ACCENT_COLOR_LIGHT } from "../../utils/colors";
import { IconProps } from "../../DEPRECATED_common/DEPRECATED_interfaces/IconProps";
import React from "react";

export const TargetOffIcon: React.FunctionComponent<IconProps> = ({ width = 16, height = 16, color = ACCENT_COLOR_LIGHT }) => (
  <svg width={width} height={height} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g opacity="0.6">
      <circle cx="8.00098" cy="8" r="5" stroke={color} strokeWidth="1.6" />
      <path
        d="M8.00078 0.800049V3M3.00078 8H0.800781M8.00078 13V15.2M13.0008 8H15.2"
        stroke={color}
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </g>
  </svg>
);
