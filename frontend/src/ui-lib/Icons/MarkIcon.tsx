import { GREEN_COLOR } from "../../utils/colors";

import { IconProps } from "../../DEPRECATED_common/DEPRECATED_interfaces/IconProps";
import React from "react";

export const MarkIcon: React.FunctionComponent<IconProps> = ({ width = 15, height = 10, color = GREEN_COLOR }) => (
  <svg width={width} height={height} viewBox="0 0 15 10" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M5.35714 10L0 5.19231L1.5 3.84615L5.35714 7.30769L13.5 0L15 1.34615L5.35714 10Z"
      fill={color}
    />
  </svg>
);
