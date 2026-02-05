import { IconProps } from "./IconProps";
import React from "react";

const TagFilterIcon: React.FunctionComponent<IconProps> = ({ width = 10, height = 5 }) => {
  return (
    <svg width={width} height={height} viewBox="0 0 24 24" fill="none" stroke="#7d8590" strokeWidth="2">
      <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
      <line x1="7" y1="7" x2="7.01" y2="7" />
    </svg>
  );
};
export default TagFilterIcon;