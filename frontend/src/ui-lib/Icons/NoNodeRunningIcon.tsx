import React from "react";

interface NoNodeRunningIconProps {
  className?: string;
  width?: number;
  height?: number;
}

const NoNodeRunningIcon: React.FC<NoNodeRunningIconProps> = ({
  className,
  width = 28,
  height = 28,
}) => {
  return (
    <svg
      className={className}
      width={width}
      height={height}
      viewBox="0 0 28 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g opacity="0.5">
        <path
          d="M19.3529 23.1765C19.3529 25.2881 21.0648 27 23.1765 27C25.2881 27 27 25.2881 27 23.1765C27 21.0648 25.2881 19.3529 23.1765 19.3529C21.0648 19.3529 19.3529 21.0648 19.3529 23.1765Z"
          stroke="#A5ACB6"
          strokeWidth="1.6"
          strokeDasharray="1 1"
        />
        <path
          d="M1 4.82353C1 6.93521 2.71185 8.64706 4.82353 8.64706C6.93521 8.64706 8.64706 6.93521 8.64706 4.82353C8.64706 2.71185 6.93521 1 4.82353 1C2.71185 1 1 2.71185 1 4.82353Z"
          stroke="#A5ACB6"
          strokeWidth="1.6"
          strokeDasharray="1 1"
        />
      </g>
      <circle
        opacity="0.5"
        cx="14"
        cy="14"
        r="6"
        stroke="#A5ACB6"
        strokeWidth="1.6"
      />
    </svg>
  );
};

export default NoNodeRunningIcon;
