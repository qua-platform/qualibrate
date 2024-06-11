import { IconProps } from "../../common/interfaces/IconProps";
import { LIGHT_GREY_FONT } from "../../utils/colors";
import React from "react";

export const WorkflowCircleIcon: React.FunctionComponent<IconProps> = ({ width = 24, height = 24, color = LIGHT_GREY_FONT }) => (
  <svg width={width} height={height} viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g opacity="0.8">
      <circle cx="11" cy="11" r="10" stroke={color} />
      <circle r="1.875" transform="matrix(1 0 0 -1 11 15.375)" fill={color} />
      <circle r="1.875" transform="matrix(1 0 0 -1 6.875 7.875)" fill={color} />
      <circle r="1.875" transform="matrix(1 0 0 -1 15.125 7.875)" fill={color} />
      <path d="M11 15.375L6.875 7.875" stroke={color} strokeWidth="1.2" />
      <path d="M15.125 7.5L11 15.375" stroke={color} strokeWidth="1.2" />
    </g>
  </svg>
);
