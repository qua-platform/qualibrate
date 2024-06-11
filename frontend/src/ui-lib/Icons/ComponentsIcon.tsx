import React from "react";
import { ACCENT_COLOR_LIGHT } from "../../utils/colors";
import { IconProps } from "../../common/interfaces/IconProps";

export const ComponentsIcon: React.FunctionComponent<IconProps> = ({ width = 24, height = 24, color = ACCENT_COLOR_LIGHT }) => (
  <svg width={width} height={height} viewBox={"0 0 24 24"} fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="7.6318" y="15.0582" width="6.77724" height="6.77724" stroke={color} strokeWidth="1.7" />
    <rect x="0.85" y="2.27451" width="6.77724" height="6.77724" stroke={color} strokeWidth="1.7" />
    <rect x="13.7071" y="1.81533" width="7.94286" height="7.94286" rx="3.97143" stroke={color} strokeWidth="1.7" />
  </svg>
);
