import { ACCENT_COLOR_LIGHT } from "../../utils/colors";
import { IconProps } from "../../common/interfaces/IconProps";
import React from "react";

export const SortingAscendingIcon: React.FunctionComponent<IconProps> = ({ width = 14, height = 14, color = ACCENT_COLOR_LIGHT }) => (
  <svg width={width} height={height} viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect y="10.8889" width="14" height="3.11111" rx="0.5" fill={color} />
    <rect y="5.44446" width="9.33333" height="3.11111" rx="0.5" fill={color} />
    <rect height="3.11111" width="4.66667" rx="0.5" fill={color} />
  </svg>
);
