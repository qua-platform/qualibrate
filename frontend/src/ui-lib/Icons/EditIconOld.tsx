import { ACTIVE_TEXT } from "../../utils/colors";
import { IconProps } from "../../common/interfaces/IconProps";
import React from "react";

export const EditIconOld: React.FunctionComponent<IconProps> = ({ width = 24, height = 24, color = ACTIVE_TEXT }) => (
  <svg width={width} height={height} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <mask id="mask0_1845_13288" maskUnits="userSpaceOnUse" x="0" y="0" width="21" height="20">
      <rect x="0.000976562" width="20" height="20" fill={color} />
    </mask>
    <g mask="url(#mask0_1845_13288)">
      <path
        d="M13.7236 2.39265C14.1141 2.00213 14.7472 2.00213 15.1378 2.39265L18.9138 6.16872C19.3044 6.55925 19.3044 7.19241 18.9138 7.58294L8.88449 17.6123C8.69695 17.7998 8.4426 17.9052 8.17738 17.9052L4.40131 17.9052C3.84902 17.9052 3.40131 17.4575 3.40131 16.9052L3.40131 13.1291C3.40131 12.8639 3.50667 12.6095 3.6942 12.422L13.7236 2.39265Z"
        fill={color}
      />
    </g>
  </svg>
);
