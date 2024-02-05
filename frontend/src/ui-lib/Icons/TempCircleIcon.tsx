import { ACCENT_COLOR_LIGHT } from "../../utils/colors";
import { IconProps } from "../../DEPRECATED_common/DEPRECATED_interfaces/IconProps";
import React from "react";

export const TempCircleIcon: React.FunctionComponent<IconProps> = ({ width = 22, height = 22, color = ACCENT_COLOR_LIGHT }) => (
  <svg width={width} height={height} viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="11" cy="11" r="10" stroke={color} />
    <path d="M11 11L13.76 14.68C13.8589 14.8118 13.7648 15 13.6 15H8.4C8.23519 15 8.14111 14.8118 8.24 14.68L11 11Z" fill={color} />
    <path d="M11 11L8.24 7.32C8.14112 7.18815 8.23519 7 8.4 7H13.6C13.7648 7 13.8589 7.18815 13.76 7.32L11 11Z" fill={color} />
  </svg>
);
