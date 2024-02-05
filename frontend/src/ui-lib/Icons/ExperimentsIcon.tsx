import React from "react";
import { ACCENT_COLOR_LIGHT } from "../../utils/colors";
import { IconProps } from "../../DEPRECATED_common/DEPRECATED_interfaces/IconProps";

export const ExperimentsIcon: React.FunctionComponent<IconProps> = ({ width = 24, height = 24, color = ACCENT_COLOR_LIGHT }) => (
  <svg width={width} height={height} viewBox={"0 0 24 24"} fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M12.0001 3.80004C7.47134 3.80004 3.80007 7.47131 3.80007 12C3.80007 12.9792 3.97168 13.9182 4.28646 14.7887C3.79777 15.1882 3.41908 15.7172 3.20276 16.3233C2.56072 15.0193 2.20007 13.5518 2.20007 12C2.20007 6.58765 6.58768 2.20004 12.0001 2.20004C13.5518 2.20004 15.0193 2.56069 16.3233 3.20273C15.7172 3.41905 15.1882 3.79774 14.7888 4.28643C13.9182 3.97165 12.9792 3.80004 12.0001 3.80004ZM7.67669 20.7973C8.98074 21.4394 10.4483 21.8 12.0001 21.8C17.4125 21.8 21.8001 17.4124 21.8001 12C21.8001 10.4483 21.4394 8.98071 20.7973 7.67666C20.581 8.28276 20.2023 8.81174 19.7136 9.2112C20.0284 10.0818 20.2001 11.0209 20.2001 12C20.2001 16.5288 16.5288 20.2 12.0001 20.2C11.0209 20.2 10.0818 20.0284 9.21123 19.7136C8.81177 20.2023 8.28279 20.581 7.67669 20.7973Z"
      fill={color}
    />
    <circle cx="18.5" cy="5.5" r="3.5" stroke={color} strokeWidth="1.6" />
    <circle cx="5.5" cy="18.5" r="3.5" stroke={color} strokeWidth="1.6" />
  </svg>
);
