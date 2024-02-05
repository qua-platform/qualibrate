import React from "react";
import { ACCENT_COLOR_LIGHT } from "../../utils/colors";
import { IconProps } from "../../DEPRECATED_common/DEPRECATED_interfaces/IconProps";

export const NotebookIcon: React.FunctionComponent<IconProps> = ({ width = 24, height = 24, color = ACCENT_COLOR_LIGHT }) => (
  <svg width={width} height={height} viewBox={"0 0 24 24"} fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M4.2 2.19983H5H21H21.8V2.99983V20.9998V21.7998H21H5H4.2V20.9998V16H2V14H4.2V8.99998H2V6.99998H4.2V2.99983V2.19983ZM5.8 16H8V14H5.8V8.99998H8V6.99998H5.8V3.79983H20.2V20.1998H5.8V16Z"
      fill={color}
    />
  </svg>
);
