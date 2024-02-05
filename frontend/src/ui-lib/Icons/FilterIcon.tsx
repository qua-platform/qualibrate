import { ACCENT_COLOR_LIGHT } from "../../utils/colors";
import { IconProps } from "../../DEPRECATED_common/DEPRECATED_interfaces/IconProps";
import React from "react";

export const FilterIcon: React.FunctionComponent<IconProps> = ({ width = 14, height = 14, color = ACCENT_COLOR_LIGHT }) => (
  <svg width={width} height={height} viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M5.31714 6.61552C5.4654 6.7754 5.5468 6.98425 5.5468 7.2003V13.5666C5.5468 13.9498 6.01338 14.1442 6.28955 13.8749L8.08177 11.8397C8.3216 11.5545 8.45387 11.4133 8.45387 11.131V7.20174C8.45387 6.98569 8.53673 6.77684 8.68353 6.61695L13.8261 1.08746C14.2113 0.672643 13.9148 0 13.345 0H0.655625C0.085838 0 -0.212137 0.671203 0.174504 1.08746L5.31714 6.61552Z"
      fill={color}
    />
  </svg>
);
