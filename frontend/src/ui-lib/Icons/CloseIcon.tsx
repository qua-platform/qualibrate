import { ACCENT_COLOR_LIGHT } from "../../utils/colors";

import { IconProps } from "../../common/interfaces/IconProps";
import React from "react";

export const CloseIcon: React.FunctionComponent<IconProps> = ({ width = 24, height = 24, color = ACCENT_COLOR_LIGHT }) => (
  <svg width={width} height={height} viewBox="0 0 24 24" fill={color} xmlns="http://www.w3.org/2000/svg">
    <rect x="5.33887" y="6.66162" width="2.11103" height="16.9706" rx="1.05552" transform="rotate(-45 5.33887 6.66162)" fill={color} />
    <rect x="17.3418" y="5.34216" width="2.11103" height="16.9706" rx="1.05552" transform="rotate(45 17.3418 5.34216)" fill={color} />
  </svg>
);
