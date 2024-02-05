import React from "react";
import { MAIN_TEXT_COLOR } from "../../utils/colors";
import { IconProps } from "../../DEPRECATED_common/DEPRECATED_interfaces/IconProps";

export const AddIcon: React.FunctionComponent<IconProps> = ({ width = 16, height = 16, color = MAIN_TEXT_COLOR }) => (
  <svg width={width} height={height} viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path fillRule="evenodd" clipRule="evenodd" d="M7 0H5V5H0V7H5V12H7V7H12V5H7V0Z" fill={color} />
    <path fillRule="evenodd" clipRule="evenodd" d="M7 0H5V5H0V7H5V12H7V7H12V5H7V0Z" fill={color} />
  </svg>
);
