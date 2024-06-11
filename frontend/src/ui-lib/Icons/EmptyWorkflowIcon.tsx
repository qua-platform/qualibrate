import { ACTIVE_TEXT } from "../../utils/colors";
import { IconProps } from "../../common/interfaces/IconProps";
import React from "react";

export const EmptyWorkflowIcon: React.FunctionComponent<IconProps> = ({ width = 18, height = 17, color = ACTIVE_TEXT }) => (
  <svg width={width} height={height} viewBox="0 0 18 17" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle r="2.50106" transform="matrix(1 0 0 -1 9.00496 13.5053)" fill={color} stroke={color} strokeWidth="1.2" />
    <ellipse rx="2.50106" ry="2.50106" transform="matrix(1 0 0 -1 3.50106 3.50114)" fill={color} stroke={color} strokeWidth="1.2" />
    <circle r="2.50106" transform="matrix(1 0 0 -1 14.5011 3.50114)" fill={color} stroke={color} strokeWidth="1.2" />
  </svg>
);
