import { ACTIVE_TEXT } from "../../utils/colors";
import { IconProps } from "../../common/interfaces/IconProps";
import React from "react";

export const PlusIcon: React.FunctionComponent<IconProps> = ({ width = 18, height = 18, color = ACTIVE_TEXT }) => (
  <svg width={width} height={height} viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="9" cy="9" r="8" stroke={color} strokeWidth="1.2" strokeLinejoin="round" />
    <rect x="8.5" y="5" width="1" height="8" fill={color} />
    <rect x="13" y="8.5" width="1" height="8" transform="rotate(90.1 13 8.5)" fill={color} />
  </svg>
);
