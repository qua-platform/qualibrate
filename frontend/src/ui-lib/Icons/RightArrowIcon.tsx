import React from "react";
import { IconProps } from "../../common/interfaces/IconProps";

export const RightArrowIcon: React.FunctionComponent<IconProps> = ({ width = 16, height = 16 }) => (
  <svg width={width} height={height} fill="#ffff" viewBox="0 0 330 330">
    <path
      id="XMLID_7_"
      d="M288.107,116.894c-5.858-5.858-15.355-5.858-21.213,0c-5.858,5.858-5.858,15.355,0,21.213L278.787,150H15
    c-8.284,0-15,6.716-15,15c0,8.284,6.716,15,15,15h263.787l-11.894,11.893c-5.858,5.858-5.858,15.355,0,21.213
    c2.929,2.929,6.768,4.394,10.606,4.394c3.839,0,7.678-1.464,10.607-4.394l37.5-37.5c5.858-5.858,5.858-15.355,0-21.213
    L288.107,116.894z"
    />
  </svg>
);
