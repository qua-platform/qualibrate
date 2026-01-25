import React from "react";
import { IconProps } from "./IconProps";

export const CheckMarkBeforeIcon: React.FunctionComponent<IconProps> = ({ width = 24, height = 24 }) => (
  <svg width={width} height={height} viewBox="0 0 26 27" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      opacity="0.5"
      fillRule="evenodd"
      clipRule="evenodd"
      d="M13 1.12549C6.37258 1.12549 1 6.49807 1 13.1255V13.1255C1 19.7529 6.37258 25.1255 13 25.1255V25.1255C19.6274 25.1255 25 19.7529 25 13.1255V13.1255C25 6.49807 19.6274 1.12549 13 1.12549V1.12549Z"
      stroke="#3CDEF8"
      strokeWidth="2"
    />
    <path d="M8 13.8255L10.8571 16.6255L18 9.62549" stroke="#3CDEF8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
