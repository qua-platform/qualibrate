import React from "react";
import { ACCENT_COLOR_LIGHT } from "../../utils/colors";
import { IconProps } from "../../common/interfaces/IconProps";

export const InfoIcon: React.FunctionComponent<IconProps> = ({
  width = 18,
  height = 18,
  color = ACCENT_COLOR_LIGHT,
}) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={width} height={height} viewBox="0 0 20 20" fill="none">
    {/* Outer Circle */}
    <circle cx="10" cy="10" r="9" stroke={color} strokeWidth="1" />
    
    {/* "i" Icon - Dot */}
    <circle cx="10" cy="6" r="1.2" fill={color} /> 
    
    {/* "i" Icon - Line */}
    <path d="M10 8.5V14" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);
