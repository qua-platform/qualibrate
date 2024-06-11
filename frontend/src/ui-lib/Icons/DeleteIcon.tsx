import { MAIN_TEXT_COLOR } from "../../utils/colors";

import { IconProps } from "../../common/interfaces/IconProps";
import React from "react";

export const DeleteIcon: React.FunctionComponent<IconProps> = ({ width = 14, height = 14, color = MAIN_TEXT_COLOR }) => (
  <svg width={width} height={height} viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M2.5 5.20007H11.5V12.2001C11.5 12.7524 11.0523 13.2001 10.5 13.2001H3.5C2.94772 13.2001 2.5 12.7524 2.5 12.2001V5.20007Z"
      stroke={color}
      strokeWidth="1.4"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M5.29688 0C4.74459 0 4.29688 0.447716 4.29688 1V1.59995H1.39531C1.00871 1.59995 0.695312 1.91335 0.695312 2.29995C0.695312 2.68655 1.00871 2.99995 1.39531 2.99995H12.5953C12.9819 2.99995 13.2953 2.68655 13.2953 2.29995C13.2953 1.91335 12.9819 1.59995 12.5953 1.59995H9.69687V1C9.69687 0.447715 9.24916 0 8.69687 0H5.29688Z"
      fill={color}
    />
  </svg>
);
