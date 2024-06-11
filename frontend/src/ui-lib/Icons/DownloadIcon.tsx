import React from "react";
import { MAIN_TEXT_COLOR } from "../../utils/colors";
import { IconProps } from "../../common/interfaces/IconProps";

export const DownloadIcon: React.FunctionComponent<IconProps> = ({ width = 16, height = 16, color = MAIN_TEXT_COLOR }) => (
  <svg width={width} height={height} viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g clipPath="url(#clip0_484_4547)">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M6.17651 6.42249V-0.825012H7.8265V6.42249L10.0015 4.2475L11.254 5.50001L7.00148 9.75252L2.74902 5.50001L4.00153 4.2475L6.17651 6.42249Z"
        fill={color}
      />
      <path d="M0 12.25H14V14H0V12.25Z" fill={color} />
    </g>
    <defs>
      <clipPath id="clip0_484_4547">
        <rect width="14" height="14" fill={color} />
      </clipPath>
    </defs>
  </svg>
);
