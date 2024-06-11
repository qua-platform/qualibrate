import { IconProps } from "../../common/interfaces/IconProps";
import { GREY_FONT } from "../../utils/colors";
import React from "react";

export const CancelIcon: React.FunctionComponent<IconProps> = ({ width = 26, height = 26, color = GREY_FONT }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={width} height={height} fill="none" viewBox="0 0 26 26">
    <path
      fill={color}
      fillRule="evenodd"
      d="M13 3C7.477 3 3 7.477 3 13s4.477 10 10 10 10-4.477 10-10S18.523 3 13 3zM8.155 9.849l3.152 3.15-3.15 3.151 1.696 1.697 3.151-3.15 3.152 3.15 1.696-1.697L14.701 13l3.15-3.151-1.696-1.698-3.151 3.151-3.152-3.15-1.697 1.697z"
      clipRule="evenodd"
    ></path>
  </svg>
);
