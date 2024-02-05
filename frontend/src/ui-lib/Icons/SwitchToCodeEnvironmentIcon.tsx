import { ACTIVE_TEXT } from "../../utils/colors";
import { IconProps } from "../../DEPRECATED_common/DEPRECATED_interfaces/IconProps";
import React from "react";

export const SwitchToCodeEnvironmentIcon: React.FunctionComponent<IconProps> = ({ width = 28, height = 27, color = ACTIVE_TEXT }) => (
  <svg width={width} height={height} viewBox="0 0 28 27" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M11.1594 7.39966H0.999414C0.668043 7.39966 0.399414 7.66829 0.399414 7.99966V23.5552C0.399414 23.8866 0.668043 24.1552 0.999414 24.1552H20.9994C21.3308 24.1552 21.5994 23.8866 21.5994 23.5552V16.5677C21.212 16.7007 20.8111 16.8049 20.3994 16.8776V22.9552H1.59941V8.59966H11.0092C11.0294 8.19084 11.0802 7.79009 11.1594 7.39966ZM12.8147 14.0745V14.6372L13.8449 15.118C13.4706 14.8023 13.1256 14.4529 12.8147 14.0745ZM15.9875 16.4133L12.8147 17.9192V19.5567L17.6667 16.9423V16.8892C17.0831 16.7913 16.521 16.6303 15.9875 16.4133ZM4.3334 15.614V15.846V16.7174V16.9493L9.06745 19.5637V17.8981L5.71938 16.2944L9.06745 14.6653V13.0067L4.3334 15.614Z"
      fill={color}
    />
    <circle cx="19" cy="9" r="8" stroke={color} strokeWidth="1.2" strokeLinejoin="round" />
    <rect x="18.5" y="5" width="1" height="8" fill={color} />
    <rect x="23" y="8.5" width="1" height="8" transform="rotate(90.1 23 8.5)" fill={color} />
  </svg>
);
