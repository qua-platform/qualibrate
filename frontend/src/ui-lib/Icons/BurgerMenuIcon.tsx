import { ACCENT_COLOR_LIGHT } from "../../utils/colors";
import { IconProps } from "../../common/interfaces/IconProps";
import React from "react";

export const BurgerMenuIcon: React.FunctionComponent<IconProps> = ({
  width = 24,
  height = 24,
  color = ACCENT_COLOR_LIGHT,
  ...restProps
}) => (
  <svg width={width} height={height} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...restProps}>
    <rect x="2" y="3.5" width="20" height="1.6" fill={color} />
    <rect x="2" y="8.6001" width="20" height="1.6" fill={color} />
    <rect x="2" y="13.7002" width="20" height="1.6" fill={color} />
    <rect x="2" y="18.8003" width="20" height="1.6" fill={color} />
  </svg>
);
