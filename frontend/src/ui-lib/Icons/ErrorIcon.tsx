import React from "react";

interface ErrorIconProps {
  className?: string;
  width?: number;
  height?: number;
}

const ErrorIcon: React.FC<ErrorIconProps> = ({
  className,
  width = 36,
  height = 36,
}) => {
  return (
    <svg
      className={className}
      width={width}
      height={height}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="20" cy="20" r="18" stroke="#ff617352" strokeWidth="3" fill="#ff61731a" />
      <line x1="20" y1="11" x2="20" y2="23" stroke="#FF6173" strokeWidth="3" strokeLinecap="round" />
      <circle cx="20" cy="29" r="2" fill="#FF6173" />
    </svg>
  );
};

export default ErrorIcon;
