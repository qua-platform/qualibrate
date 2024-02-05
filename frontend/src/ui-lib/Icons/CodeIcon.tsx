import { MENU_TEXT_COLOR } from "../../utils/colors";

import { IconProps } from "../../DEPRECATED_common/DEPRECATED_interfaces/IconProps";
import React from "react";

export const CodeIcon: React.FunctionComponent<IconProps> = ({ width = 24, height = 18, color = MENU_TEXT_COLOR }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={width} height={height} viewBox="0 0 24 18" fill="none">
    <path
      d="M1.5769 9.09677L7.30397 11.9772V14.6755L0 10.4402V8.65275L1.5769 9.09677ZM7.30397 6.74004L1.5769 9.66603L0 10.0645V8.27704L7.30397 4.05313V6.74004Z"
      fill={color}
    />
    <path d="M15.0498 0L10.1372 18H8.49964L13.4209 0H15.0498Z" fill={color} />
    <path
      d="M22.3451 9.55218L16.5141 6.6945V4.04175L24 8.26565V10.0645L22.3451 9.55218ZM16.5141 12.0114L22.3625 9.09677L24 8.64137V10.4288L16.5141 14.6641V12.0114Z"
      fill={color}
    />
  </svg>
);
