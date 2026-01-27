import React from "react";

const GraphStatusIcon: React.FC<{ width?: number; height?: number; className?: string }> = ({
  width = 24,
  height = 24,
  className,
}) => {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      viewBox="0 0 25 24"
      fill="none"
    >
      <g clipPath="url(#clip0)">
        <circle
          cx="18.1734"
          cy="6.64683"
          r="4.5"
          transform="rotate(-60 18.1734 6.64683)"
          stroke="#ffffff"
          strokeWidth="1.2"
        />
        <circle
          cx="13.2224"
          cy="19.9547"
          r="3"
          transform="rotate(-60 13.2224 19.9547)"
          stroke="#ffffff"
          strokeWidth="1.5"
          strokeDasharray="1 1"
        />
        <circle
          cx="4.09803"
          cy="9.09821"
          r="3"
          transform="rotate(-60 4.09803 9.09821)"
          stroke="#ffffff"
          strokeWidth="1.5"
          strokeDasharray="1 1"
        />
        <path
          d="M14.0394 15.808L16.3265 10.7776M13.5093 6.72617L6.99985 8.49902"
          stroke="#ffffff"
          strokeWidth="1.5"
          strokeDasharray="1 1"
        />
      </g>
      <defs>
        <clipPath id="clip0">
          <rect width="25" height="24" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
};

export default GraphStatusIcon;
