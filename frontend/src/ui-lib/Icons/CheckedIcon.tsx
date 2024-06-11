import { IconProps } from "../../common/interfaces/IconProps";
import { MAIN_TEXT_COLOR } from "../../utils/colors";
import React from "react";

export const CheckedIcon: React.FunctionComponent<IconProps> = ({ width = 15, height = 13, color = MAIN_TEXT_COLOR }) => (
  <svg width={width} height={height} viewBox="0 0 15 13" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M11.3984 7.19997V9.6C11.3984 10.3732 10.7716 11 9.99844 11H2.99844C2.22524 11 1.59844 10.3732 1.59844 9.6V2.6C1.59844 1.8268 2.22524 1.2 2.99844 1.2H9.99844C10.385 1.2 10.735 1.35669 10.9884 1.61004L11.8369 0.761507C11.3664 0.291009 10.7164 0 9.99844 0H2.99844C1.5625 0 0.398438 1.16406 0.398438 2.6V9.6C0.398438 11.0359 1.5625 12.2 2.99844 12.2H9.99844C11.4344 12.2 12.5984 11.0359 12.5984 9.6V5.99997L11.3984 7.19997Z"
      fill={color}
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M7.92662 8.59998L3.99805 4.75382L5.09805 3.6769L7.92662 6.44613L13.898 0.599976L14.998 1.6769L7.92662 8.59998Z"
      fill={color}
    />
  </svg>
);
