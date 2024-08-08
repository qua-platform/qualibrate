import React from "react";
import { IconProps } from "../../common/interfaces/IconProps";

export const CalibrationIcon: React.FunctionComponent<IconProps> = ({ width = 24, height = 24 }) => (
  <svg width={width} height={height} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="3" y="10" width="18" height="9" stroke="#C6CDD6" strokeWidth="1.5" strokeLinejoin="round" />
    <path d="M7 4H17L21 10H3L7 4Z" stroke="#C6CDD6" strokeWidth="1.5" strokeLinejoin="round" />
    <rect x="8" y="13.6" width="8" height="1.5" fill="#C6CDD6" />
  </svg>
);
