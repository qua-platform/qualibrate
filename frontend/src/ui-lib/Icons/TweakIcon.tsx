import { ACCENT_COLOR_LIGHT } from "../../utils/colors";
import { IconProps } from "../../DEPRECATED_common/DEPRECATED_interfaces/IconProps";
import React from "react";

const TweakIcon: React.FunctionComponent<IconProps & { isActive?: boolean }> = ({
  width = 14,
  height = 14,
  color = ACCENT_COLOR_LIGHT,
  isActive,
}) => (
  <svg width={width} height={height} viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
    {isActive ? (
      <path
        d="M2.23676 7.37459C2.09757 7.1956 2.09625 6.94536 2.23354 6.76491L6.60768 1.01566C6.80606 0.754916 7.19741 0.752238 7.39934 1.01024L11.899 6.75943C12.0419 6.94201 12.0405 7.19888 11.8957 7.37993L7.396 13.005C7.19407 13.2574 6.80928 13.2547 6.61085 12.9996L2.23676 7.37459Z"
        fill={color}
        stroke={color}
        strokeWidth="1.6"
      />
    ) : (
      <path
        opacity="0.6"
        d="M2.23676 7.37459C2.09757 7.1956 2.09625 6.94536 2.23354 6.76491L6.60768 1.01566C6.80606 0.754916 7.19741 0.752238 7.39934 1.01024L11.899 6.75943C12.0419 6.94201 12.0405 7.19888 11.8957 7.37993L7.396 13.005C7.19407 13.2574 6.80928 13.2547 6.61085 12.9996L2.23676 7.37459Z"
        stroke={color}
        strokeWidth="1.6"
      />
    )}
  </svg>
);

export default TweakIcon;
