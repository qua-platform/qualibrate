import { IconProps } from "./IconProps";
import React from "react";

const NotificationSuccessIcon: React.FunctionComponent<IconProps> = ({ width = 24, height = 24 }) => {
  return (
    <svg width={width} height={height} viewBox="0 0 16 16" fill="currentColor">
      <path d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.751.751 0 0 1 .018-1.042.751.751 0 0 1 1.042-.018L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0Z" />
    </svg>
  );
};

export default NotificationSuccessIcon;