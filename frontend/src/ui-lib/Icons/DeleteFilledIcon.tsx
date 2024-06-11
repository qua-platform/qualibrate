import { ACTIVE_TEXT } from "../../utils/colors";
import { IconProps } from "../../common/interfaces/IconProps";
import React from "react";

export const DeleteFilledIcon: React.FunctionComponent<IconProps> = ({ width = 24, height = 24, color = ACTIVE_TEXT }) => (
  <svg width={width} height={height} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="5.00098" y="8" width="10" height="10" rx="1" fill={color} />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M8.00098 2C7.44869 2 7.00098 2.44772 7.00098 3V4L4.00098 4C3.44869 4 3.00098 4.44772 3.00098 5C3.00098 5.55228 3.44869 6 4.00098 6H16.001C16.5533 6 17.001 5.55228 17.001 5C17.001 4.44772 16.5533 4 16.001 4L13.001 4V3C13.001 2.44772 12.5533 2 12.001 2H8.00098Z"
      fill={color}
    />
  </svg>
);
