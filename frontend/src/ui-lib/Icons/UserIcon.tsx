import { ACCENT_COLOR_LIGHT } from "../../utils/colors";
import { IconProps } from "../../DEPRECATED_common/DEPRECATED_interfaces/IconProps";
import React from "react";

export const UserIcon: React.FunctionComponent<IconProps> = ({ width = 20, height = 20, color = ACCENT_COLOR_LIGHT }) => (
  <svg width={width} height={height} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="8.02734" cy="4.5" r="3.5" stroke={color} strokeWidth="1.2" />
    <path
      d="M1.70117 15C2.37834 12.1333 4.95366 10 8.02724 10C11.1008 10 13.6761 12.1333 14.3533 15H1.70117Z"
      stroke={color}
      strokeWidth="1.2"
      strokeLinejoin="round"
    />
  </svg>
);
