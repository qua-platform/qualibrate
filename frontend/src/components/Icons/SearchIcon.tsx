import React from "react";
import { ACCENT_COLOR_LIGHT } from "../../utils/colors";
import { IconProps } from "./IconProps";

export const SearchIcon: React.FunctionComponent<IconProps> = ({ width = 24, height = 24, color = ACCENT_COLOR_LIGHT }) => (
  <svg width={width} height={height} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="m21.878 20.7-5.81-5.81a7.876 7.876 0 0 0 1.765-4.973C17.833 5.55 14.282 2 9.917 2 5.55 2 2 5.551 2 9.917c0 4.365 3.551 7.916 7.917 7.916a7.876 7.876 0 0 0 4.973-1.765l5.81 5.81a.417.417 0 0 0 .589 0l.589-.59a.417.417 0 0 0 0-.588ZM9.917 16.166a6.257 6.257 0 0 1-6.25-6.25 6.257 6.257 0 0 1 6.25-6.25 6.257 6.257 0 0 1 6.25 6.25 6.257 6.257 0 0 1-6.25 6.25Z"
      fill={color}
    />
  </svg>
);
