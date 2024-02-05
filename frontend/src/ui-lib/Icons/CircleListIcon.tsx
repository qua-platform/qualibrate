import { ACCENT_COLOR_LIGHT } from "../../utils/colors";
import { IconProps } from "../../DEPRECATED_common/DEPRECATED_interfaces/IconProps";
import React from "react";

export const CircleListIcon: React.FunctionComponent<IconProps> = ({ width = 44, height = 44, color = ACCENT_COLOR_LIGHT }) => (
  <svg width={width} height={height} viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="22" cy="22" r="21.4" stroke={color} strokeWidth="1.2" />
    <path d="M14 16H31" stroke={color} strokeWidth="2" />
    <path d="M14 20H31" stroke={color} strokeWidth="2" />
    <path d="M14 24H31" stroke={color} strokeWidth="2" />
    <path d="M14 28H23" stroke={color} strokeWidth="2" />
  </svg>
);
