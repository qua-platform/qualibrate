import React from "react";
import { ACCENT_COLOR_LIGHT } from "../../utils/colors";
import { IconProps } from "../../DEPRECATED_common/DEPRECATED_interfaces/IconProps";

export const DashboardIcon: React.FunctionComponent<IconProps> = ({ width = 24, height = 24, color = ACCENT_COLOR_LIGHT }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={width} height={height} fill="none" viewBox="0 0 24 24">
    <path stroke={color} strokeLinejoin="round" strokeWidth="1.5" d="M1 1H7.769V7.769H1z"></path>
    <path stroke={color} strokeLinejoin="round" strokeWidth="1.5" d="M1 11.154H7.769V17.923000000000002H1z"></path>
    <path stroke={color} strokeLinejoin="round" strokeWidth="1.5" d="M11.154 1H17.923000000000002V7.769H11.154z"></path>
    <path stroke={color} strokeLinejoin="round" strokeWidth="1.5" d="M11.154 11.154H23V23H11.154z"></path>
  </svg>
);
