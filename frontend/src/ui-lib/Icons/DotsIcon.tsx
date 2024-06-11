import { IconProps } from "../../common/interfaces/IconProps";
import { MENU_TEXT_COLOR } from "../../utils/colors";
import React from "react";

export const DotsIcon: React.FunctionComponent<IconProps> = ({ width = 16, height = 16, color = MENU_TEXT_COLOR }) => (
  <svg width={width} height={height} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M3.2 0C1.43269 0 0 1.43269 0 3.2C0 4.96731 1.43269 6.4 3.2 6.4C4.96731 6.4 6.4 4.96731 6.4 3.2C6.4 1.43269 4.96731 0 3.2 0ZM3.2 9.6C1.43269 9.6 0 11.0327 0 12.8C0 14.5673 1.43269 16 3.2 16C4.96731 16 6.4 14.5673 6.4 12.8C6.4 11.0327 4.96731 9.6 3.2 9.6ZM9.6 12.8C9.6 11.0327 11.0327 9.6 12.8 9.6C14.5673 9.6 16 11.0327 16 12.8C16 14.5673 14.5673 16 12.8 16C11.0327 16 9.6 14.5673 9.6 12.8ZM12.8 0C11.0327 0 9.6 1.43269 9.6 3.2C9.6 4.96731 11.0327 6.4 12.8 6.4C14.5673 6.4 16 4.96731 16 3.2C16 1.43269 14.5673 0 12.8 0Z"
      fill={color}
    />
  </svg>
);
