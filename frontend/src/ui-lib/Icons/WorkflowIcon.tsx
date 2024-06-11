import { MENU_TEXT_COLOR } from "../../utils/colors";

import { IconProps } from "../../common/interfaces/IconProps";
import React from "react";

export const WorkflowIcon: React.FunctionComponent<IconProps> = ({ width = 21, height = 20, color = MENU_TEXT_COLOR }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={width} height={height} viewBox="0 0 21 20" fill="none">
    <circle r="3.20833" transform="matrix(1 0 0 -1 10.2669 16.0417)" fill={color} />
    <circle r="3.20833" transform="matrix(1 0 0 -1 3.20833 3.20829)" fill={color} />
    <circle r="3.20833" transform="matrix(1 0 0 -1 17.3245 3.20829)" fill={color} />
    <path d="M10.2663 16.0416L3.20801 3.20829" stroke={color} strokeWidth="1.2" />
    <path d="M17.3249 2.56665L10.2666 16.0417" stroke={color} strokeWidth="1.2" />
  </svg>
);
