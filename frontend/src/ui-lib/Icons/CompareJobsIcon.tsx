import { ACTIVE_TEXT } from "../../utils/colors";
import { IconProps } from "../../common/interfaces/IconProps";
import React from "react";

export const CompareJobsIcon: React.FunctionComponent<IconProps> = ({ width = 215, height = 48, color = ACTIVE_TEXT }) => (
  <svg width={width} height={height} viewBox="0 0 215 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect opacity="0.8" x="43.5" y="0.5" width="109" height="19" rx="1.5" stroke={color} />
    <rect opacity="0.8" x="63.5" y="28.5" width="109" height="19" rx="1.5" stroke={color} />
    <g opacity="0.6">
      <path d="M50.5 41H16.5C7.93959 41 1 34.0604 1 25.5C1 16.9396 7.93959 10 16.5 10H30" stroke={color} />
      <circle cx="53" cy="41" r="3" stroke={color} />
      <path d="M35 10L29.75 14.3301L29.75 5.66987L35 10Z" stroke={color} />
    </g>
    <g opacity="0.6">
      <path d="M164.5 8H198.5C207.06 8 214 14.9396 214 23.5C214 32.0604 207.06 39 198.5 39H185" stroke={color} />
      <circle cx="162" cy="8" r="3" transform="rotate(-180 162 8)" stroke={color} />
      <path d="M180 39L185.25 34.6699L185.25 43.3301L180 39Z" stroke={color} />
    </g>
  </svg>
);
