import React from "react";
import { IconProps } from "../../DEPRECATED_common/DEPRECATED_interfaces/IconProps";
import { GREY_FONT } from "../../utils/colors";

const UsedByIcon: React.FC<IconProps> = ({ color = GREY_FONT, height = 26, width = 26 }) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={width} height={height} viewBox="0 0 27 27" fill="none">
      <path
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.2"
        d="M9.39 5.222v15.556m0 0l4.444-4.445m-4.445 4.445l-4.444-4.445m13.333 4.445V5.222m0 0l4.445 4.445m-4.445-4.445l-4.444 4.445"
      ></path>
    </svg>
  );
};

export default UsedByIcon;
