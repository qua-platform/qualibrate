import { ACCENT_COLOR_LIGHT } from "../../utils/colors";
import { IconProps } from "../../common/interfaces/IconProps";
import React from "react";

export const SortingTableIcon: React.FunctionComponent<IconProps> = ({ width = 14, height = 14, color = ACCENT_COLOR_LIGHT }) => (
  <svg width={width} height={height} viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="5" width="9" height="3.11111" rx="0.5" fill={color} />
    <rect x="5" y="5.44434" width="9" height="3.11111" rx="0.5" fill={color} />
    <rect x="5" y="10.8887" width="9" height="3.11111" rx="0.5" fill={color} />
    <rect width="3" height="14" rx="0.5" fill={color} />
  </svg>
);
