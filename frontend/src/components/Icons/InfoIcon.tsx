import React from "react";
import { ACCENT_COLOR_LIGHT } from "../../utils/colors";
import { IconProps } from "./IconProps";

export const InfoIcon: React.FunctionComponent<IconProps> = ({
  width = 18,
  height = 18,
  color = ACCENT_COLOR_LIGHT,
}) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={width} height={height} viewBox="0 0 20 20" fill="none">
    <circle cx="10" cy="10" r="9" stroke={color} strokeWidth="1" />
    <circle cx="10" cy="6" r="1.2" fill={color} />
    <path d="M10 9.5V14" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </svg>
);
