import React from "react";
import { MAIN_TEXT_COLOR } from "../../utils/colors";
import { IconProps } from "../../common/interfaces/IconProps";

export const CheckMarkIcon: React.FunctionComponent<IconProps> = ({ width = 32, height = 32, color = MAIN_TEXT_COLOR }) => (
  <svg width={width} height={height} viewBox="4 4 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path fill="#4caf50" d="M44,24c0,11.045-8.955,20-20,20S4,35.045,4,24S12.955,4,24,4S44,12.955,44,24z" />
    <path fill={color} d="M34.602,14.602L21,28.199l-5.602-5.598l-2.797,2.797L21,33.801l16.398-16.402L34.602,14.602z" />
  </svg>
);
