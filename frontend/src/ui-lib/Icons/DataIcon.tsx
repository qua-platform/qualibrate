import React from "react";
import { ACCENT_COLOR_LIGHT } from "../../utils/colors";
import { IconProps } from "../../common/interfaces/IconProps";

export const DataIcon: React.FunctionComponent<IconProps> = ({ width = 24, height = 24, color = ACCENT_COLOR_LIGHT }) => (
  <svg width={width} height={height} viewBox={"0 0 24 24"} fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M7 16L10.3876 9.72807C10.9439 8.69828 12.2616 8.36407 13.2414 9.00429L14.7586 9.99571C15.7384 10.6359 17.0561 10.3017 17.6124 9.27193L21 3"
      stroke={color}
      strokeWidth="1.5"
    />
    <path d="M22 21L2.5 21L2.5 2" stroke={color} strokeWidth="1.5" />
  </svg>
);
