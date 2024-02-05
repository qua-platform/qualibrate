import React from "react";
import { ACCENT_COLOR_LIGHT } from "../../utils/colors";
import { IconProps } from "../../DEPRECATED_common/DEPRECATED_interfaces/IconProps";

export const FlowIcon: React.FunctionComponent<IconProps> = ({ width = 22, height = 22, color = ACCENT_COLOR_LIGHT }) => (
  <svg width={width} height={height} viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="11" cy="11" r="10" stroke={color} />
    <circle cx="15.2856" cy="7.99993" r="1.71429" fill={color} />
    <ellipse cx="6.71429" cy="13.9999" rx="1.71429" ry="1.71429" fill={color} />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M10.3569 9.71432C10.3569 8.41251 11.4122 7.35718 12.714 7.35718H14.8569V8.64289H12.714C12.1223 8.64289 11.6426 9.12259 11.6426 9.71432V12.2857C11.6426 13.5876 10.5872 14.6429 9.28544 14.6429H7.14258V13.3572H9.28544C9.87717 13.3572 10.3569 12.8775 10.3569 12.2857V9.71432Z"
      fill={color}
    />
  </svg>
);
