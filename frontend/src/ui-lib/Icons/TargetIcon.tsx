import { LIGHT_GREY_FONT } from "../../utils/colors";

import { IconProps } from "../../DEPRECATED_common/DEPRECATED_interfaces/IconProps";
import React from "react";

export const TargetIcon: React.FunctionComponent<IconProps> = ({ width = 24, height = 24, color = LIGHT_GREY_FONT }) => (
  <svg width={width} height={height} viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g opacity="0.8">
      <circle cx="11" cy="11" r="10" stroke={color} />
      <circle cx="11" cy="11" r="5" stroke={color} strokeWidth="1.2" />
      <circle cx="11" cy="11" r="2" fill={color} />
    </g>
  </svg>
);
