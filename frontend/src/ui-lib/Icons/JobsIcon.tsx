import React from "react";
import { IconProps } from "../../DEPRECATED_common/DEPRECATED_interfaces/IconProps";
import { ACCENT_COLOR_LIGHT } from "../../utils/colors";

export const JobsIcon: React.FunctionComponent<IconProps> = ({ width = 26, height = 24, color = ACCENT_COLOR_LIGHT }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={width} height={height} fill="none" viewBox="0 0 26 24">
    <path
      fill={color}
      fillRule="evenodd"
      d="M3.5 3a.5.5 0 00-.5.5v18a.5.5 0 00.5.5h10.506l-.756-.808H3.9V3.809h4.95V3H3.5zm16.6 10.482l.9-.963V3.5a.5.5 0 00-.5-.5h-5.35v.809h4.95v9.673z"
      clipRule="evenodd"
    />
    <path
      fill={color}
      d="M14.006 22v.4h.921l-.63-.673-.291.273zm-.756-.808l.292-.274-.119-.127h-.173v.4zm-9.35 0h-.4v.4h.4v-.4zm0-17.383v-.4h-.4v.4h.4zm4.95 0v.4h.4v-.4h-.4zm0-.809h.4v-.4h-.4V3zM20.1 13.482h-.4v1.014l.692-.74-.292-.274zm.9-.963l.292.274.108-.116v-.158H21zM15.15 3v-.4h-.4V3h.4zm0 .809h-.4v.4h.4v-.4zm4.95 0h.4v-.4h-.4v.4zM3.4 3.5a.1.1 0 01.1-.1v-.8a.9.9 0 00-.9.9h.8zm0 18v-18h-.8v18h.8zm.1.1a.1.1 0 01-.1-.1h-.8a.9.9 0 00.9.9v-.8zm10.506 0H3.5v.8h10.506v-.8zm.292.127l-.756-.809-.585.547.756.808.585-.546zM3.9 21.59h9.35v-.8H3.9v.8zM3.5 3.81v17.383h.8V3.809h-.8zm5.35-.4H3.9v.8h4.95v-.8zM8.45 3v.809h.8V3h-.8zm-4.95.4h5.35v-.8H3.5v.8zm16.892 10.355l.9-.962-.584-.547-.9.963.584.546zM20.6 3.5v9.02h.8V3.5h-.8zm-.1-.1a.1.1 0 01.1.1h.8a.9.9 0 00-.9-.9v.8zm-5.35 0h5.35v-.8h-5.35v.8zm.4.409V3h-.8v.809h.8zm4.55-.4h-4.95v.8h4.95v-.8zm.4 10.073V3.809h-.8v9.673h.8z"
    />
    <path stroke={color} strokeWidth="1.7" d="M14 17.235L17.52 21 25 13" />
    <path
      fill={color}
      fillRule="evenodd"
      stroke={color}
      strokeLinejoin="round"
      strokeWidth="0.6"
      d="M8.799 2h6.4v3.2h-6.4V2zm.8.8v1.6h4.8V2.8h-4.8z"
      clipRule="evenodd"
    />
    <path fill={color} fillRule="evenodd" d="M15.199 9.833h-6.4v-1.5h6.4v1.5zM15.199 13.344h-6.4v-1.5h6.4v1.5z" clipRule="evenodd" />
  </svg>
);
