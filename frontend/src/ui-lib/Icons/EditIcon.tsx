import { ACTIVE_TEXT } from "../../utils/colors";
import { IconProps } from "../../common/interfaces/IconProps";
import React from "react";

export const EditIcon: React.FunctionComponent<IconProps> = ({ width = 13, height = 13, color = ACTIVE_TEXT }) => (
  <svg width={width} height={height} viewBox="0 0 13 13" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g clipPath="url(#clip0_2158_393)">
      <path
        d="M5.95831 2.16669H2.16665C1.87933 2.16669 1.60378 2.28082 1.40061 2.48399C1.19745 2.68715 1.08331 2.9627 1.08331 3.25002V10.8334C1.08331 11.1207 1.19745 11.3962 1.40061 11.5994C1.60378 11.8026 1.87933 11.9167 2.16665 11.9167H9.74998C10.0373 11.9167 10.3128 11.8026 10.516 11.5994C10.7192 11.3962 10.8333 11.1207 10.8333 10.8334V7.04169"
        stroke="white"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10.0208 1.35419C10.2363 1.1387 10.5286 1.01764 10.8333 1.01764C11.1381 1.01764 11.4303 1.1387 11.6458 1.35419C11.8613 1.56968 11.9824 1.86194 11.9824 2.16669C11.9824 2.47143 11.8613 2.7637 11.6458 2.97919L6.49998 8.12502L4.33331 8.66669L4.87498 6.50002L10.0208 1.35419Z"
        stroke="white"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </g>
    <defs>
      <clipPath id="clip0_2158_393">
        <rect width="13" height="13" fill="white" />
      </clipPath>
    </defs>
  </svg>
);
