import React from "react";
import { IconProps } from "../../common/interfaces/IconProps";

export const UpArrowIcon: React.FunctionComponent<IconProps> = ({ width = 32, height = 32 }) => (
  <svg
    width={width}
    height={height}
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    role="img"
    preserveAspectRatio="xMidYMid meet"
  >
    <circle cx="32" cy="32" r="30" fill="#05869c"></circle>
    <path fill="#ffffff" d="M48 30.3L32 15L16 30.3h10.6V49h10.3V30.3z"></path>
  </svg>
);
