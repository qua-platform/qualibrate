import { ACCENT_COLOR_LIGHT, SECONDARY_BLUE_BUTTON } from "../../utils/colors";

import { IconProps } from "../../DEPRECATED_common/DEPRECATED_interfaces/IconProps";
import React from "react";

export const AppliedFilterIcon: React.FunctionComponent<IconProps> = ({
  width = 14,
  height = 14,
  color = ACCENT_COLOR_LIGHT,
  subColor = SECONDARY_BLUE_BUTTON,
}) => (
  <svg width={width} height={height} viewBox="0 0 15 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M7.10002 2H0.655625C0.085838 2 -0.212137 2.6712 0.174504 3.08746L5.31714 8.61552C5.4654 8.7754 5.5468 8.98425 5.5468 9.2003V15.5666C5.5468 15.9498 6.01338 16.1442 6.28955 15.8749L8.08177 13.8397C8.09436 13.8247 8.10665 13.8101 8.11864 13.7959C8.33512 13.5393 8.45387 13.3985 8.45387 13.131V9.20174C8.45387 8.98569 8.53673 8.77684 8.68353 8.61695L9.75247 7.4676C8.11984 6.64465 7 4.9531 7 3C7 2.65753 7.03443 2.32311 7.10002 2Z"
      fill={color}
    />
    <circle cx="12" cy="3" r="3" fill={subColor} />
  </svg>
);
