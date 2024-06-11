import React from "react";
import { GREY_FONT } from "../../utils/colors";
import { IconProps } from "../../common/interfaces/IconProps";

export const DriverIcon: React.FunctionComponent<IconProps> = ({ width = 24, height = 24, color = GREY_FONT }) => (
  <svg width={width} height={height} viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g opacity="0.8">
      <circle cx="11" cy="11" r="10" stroke={color} />
      <g opacity="0.9">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M15.7772 12.4806L17 12.4762L16.989 9.47833L15.7658 9.48317C15.5408 8.7757 15.1627 8.13651 14.6703 7.60456L15.2787 6.54161L12.6772 5.05273L12.0695 6.11464C11.7249 6.03956 11.3671 6 11 6C10.62 6 10.2499 6.04239 9.89416 6.1227L9.27848 5.0653L6.68809 6.57426L7.30416 7.63234C6.81604 8.16773 6.44268 8.80957 6.22299 9.51897L5 9.52366L5.01102 12.5215L6.23425 12.5169C6.45926 13.2245 6.83749 13.8637 7.32995 14.3957L6.72173 15.4584L9.32314 16.9473L9.93086 15.8854C10.2753 15.9605 10.633 16 11 16C11.38 16 11.7501 15.9576 12.1058 15.8773L12.7216 16.9346L15.312 15.4257L14.6957 14.3678C15.184 13.8323 15.5575 13.1902 15.7772 12.4806ZM14 11C14 12.6569 12.6569 14 11 14C9.34315 14 8 12.6569 8 11C8 9.34315 9.34315 8 11 8C12.6569 8 14 9.34315 14 11Z"
          fill={color}
        />
      </g>
    </g>
  </svg>
);
