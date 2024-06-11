import { ACCENT_COLOR_LIGHT } from "../../utils/colors";
import { IconProps } from "../../common/interfaces/IconProps";
import React from "react";

export const UserFilledIcon: React.FunctionComponent<IconProps> = ({ width = 14, height = 15, color = ACCENT_COLOR_LIGHT }) => (
  <svg width={width} height={height} viewBox="0 0 14 15" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M7.04985 15V14.9998H6.95048H0C0 10.2807 4.46413 10.2818 5.45477 9.04788L5.56813 8.48519C4.17634 7.83034 3.19384 6.25154 3.19384 4.40505C3.19384 1.97239 4.89827 0 7.00027 0C9.10227 0 10.8067 1.97239 10.8067 4.40505C10.8067 6.23583 9.84167 7.80476 8.46843 8.46998L8.59752 9.10942C9.68437 10.2835 14 10.3601 14 15H7.04985Z"
      fill={color}
    />
  </svg>
);
