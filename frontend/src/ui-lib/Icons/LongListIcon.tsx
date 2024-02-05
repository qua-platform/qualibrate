import { IconProps } from "../../DEPRECATED_common/DEPRECATED_interfaces/IconProps";
import { MENU_TEXT_COLOR } from "../../utils/colors";
import React from "react";

export const LongListIcon: React.FunctionComponent<IconProps> = ({ width = 20, height = 20, color = MENU_TEXT_COLOR }) => (
  <svg width={width} height={height} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="1" y="1.5" width="18" height="2" fill={color} />
    <rect x="1" y="6.5" width="18" height="2" fill={color} />
    <rect x="1" y="11.5" width="18" height="2" fill={color} />
    <rect x="1" y="16.5" width="18" height="2" fill={color} />
  </svg>
);
