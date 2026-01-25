import { IconProps } from "./IconProps";
import { MAIN_TEXT_COLOR } from "../../utils/colors";
import React from "react";
import { getSvgOptions } from "./utils";

export const ArrowIcon: React.FunctionComponent<IconProps> = ({ width = 10, height = 5, color = MAIN_TEXT_COLOR, options }) => {
  const svgOptions = getSvgOptions({
    rotationDegree: options?.rotationDegree || 0,
  });

  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 10 5"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...svgOptions}
      transform="rotate(90)"
    >
      <path d="M5 4.7998L9.33013 0.299805H0.669873L5 4.7998Z" fill={color} />
    </svg>
  );
};
