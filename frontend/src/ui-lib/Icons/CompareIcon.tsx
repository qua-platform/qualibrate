import React from "react";
import { MAIN_TEXT_COLOR } from "../../utils/colors";
import { IconProps } from "../../DEPRECATED_common/DEPRECATED_interfaces/IconProps";

export const CompareIcon: React.FunctionComponent<IconProps> = ({ width = 16, height = 16, color = MAIN_TEXT_COLOR }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={width} height={height} viewBox="0 0 15 16" fill="none">
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M11.7005 3.61212H9.19336V2.1496H11.7005C12.6813 2.1496 13.4765 2.9447 13.4765 3.92551V12.7006H12.0139V3.92551C12.0139 3.75243 11.8736 3.61212 11.7005 3.61212Z"
      fill={color}
    />
    <path d="M6.78613 2.9855L9.9201 -7.76638e-06L9.9201 5.97101L6.78613 2.9855Z" fill={color} />
    <circle cx="12.7437" cy="12.7008" r="1.88038" fill={color} />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M3.54849 12.3875H6.05566V13.85H3.54849C2.56768 13.85 1.77257 13.0549 1.77257 12.0741V3.29894H3.23509V12.0741C3.23509 12.2471 3.3754 12.3875 3.54849 12.3875Z"
      fill={color}
    />
    <path d="M8.46289 13.0141L5.32892 15.9996L5.32892 10.0286L8.46289 13.0141Z" fill={color} />
    <circle cx="2.50536" cy="3.29876" r="1.88038" transform="rotate(-180 2.50536 3.29876)" fill={color} />
  </svg>
);
