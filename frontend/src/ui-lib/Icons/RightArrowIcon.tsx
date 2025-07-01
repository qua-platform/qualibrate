import React from "react";
import { IconProps } from "../../common/interfaces/IconProps";

export const RightArrowIcon: React.FunctionComponent<IconProps> = ({ width = 10, height = 10 }) => (
  <svg width={width} height={height} viewBox="0 0 10 8" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M7.29287 3.62553L5.14642 1.47908L5.85353 0.771973L8.85353 3.77197L9.20708 4.12553L8.85353 4.47908L5.85353 7.47908L5.14642 6.77197L7.29287 4.62553H0V3.62553H7.29287Z"
      fill="var(--grey-highlight)"
    />
  </svg>
);
