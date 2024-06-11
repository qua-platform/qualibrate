import { ACCENT_COLOR_LIGHT } from "../../utils/colors";
import { IconProps } from "../../common/interfaces/IconProps";
import React from "react";

export const RetryIcon: React.FunctionComponent<IconProps> = ({ width = 26, height = 26, color = ACCENT_COLOR_LIGHT }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={width} height={height} viewBox="0 0 26 26" fill="none">
    <path
      stroke={color}
      strokeWidth="2.4"
      d="M13.834 21.376a8.125 8.125 0 007.038-12.188m-7.038-4.063a8.125 8.125 0 00-6.771 12.618"
    ></path>
    <path fill={color} d="M18.834 5.25l-5 4.5v-9l5 4.5zm-10.001 16l5 4v-8l-5 4z"></path>
  </svg>
);
