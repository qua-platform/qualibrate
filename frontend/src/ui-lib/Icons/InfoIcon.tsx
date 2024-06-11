import { IconProps } from "../../common/interfaces/IconProps";
import React from "react";
import { ACTIVE_TEXT } from "../../utils/colors";

export const InfoIcon: React.FunctionComponent<IconProps> = ({ width = 16, height = 16, color = ACTIVE_TEXT }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={width} height={height} fill="none" viewBox="0 0 16 16">
    <g clipPath="url(#a)">
      <path
        fill={color}
        d="M8 16c4.42 0 8-3.58 8-8s-3.58-8-8-8-8 3.58-8 8 3.58 8 8 8zM6.844 3.556h2.312v4.888H6.844V3.556zm0 6.577h2.312v2.311H6.844v-2.31z"
      ></path>
    </g>
    <defs>
      <clipPath id="a">
        <path fill="#fff" d="M16 16H0V0h16z"></path>
      </clipPath>
    </defs>
  </svg>
);
