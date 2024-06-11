import { GREY_FONT } from "../../utils/colors";
import { IconProps } from "../../common/interfaces/IconProps";
import React from "react";

export const ListIcon: React.FC<IconProps> = ({ width = 26, height = 26, color = GREY_FONT }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={width} height={height} viewBox="0 0 26 26" fill="none">
    <path fill={color} fillRule="evenodd" d="M16.375 9.4h-6.75v1.575h6.75V9.4zm0 5.625h-6.75V16.6h6.75v-1.575z" clipRule="evenodd"></path>
    <path stroke={color} strokeLinejoin="round" strokeWidth="1.2" d="M6.25 5.125h13.5v15.75H6.25z"></path>
  </svg>
);
