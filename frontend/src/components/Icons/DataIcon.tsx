import React from "react";

const DataIcon: React.FC<{ width?: number; height?: number; className?: string }> = ({
  width = 25,
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
      <path
        d="M7 16L10.3876 9.72807C10.9439 8.69828 12.2616 8.36407 13.2414 9.00429L14.7586 9.99571C15.7384 10.6359 17.0561 10.3017 17.6124 9.27193L21 3"
        stroke="#ffffff"
        strokeWidth="1.2"
      />
      <path
        d="M22 21L2.5 21L2.5 2"
        stroke="#ffffff"
        strokeWidth="1.5"
        strokeDasharray="1 1"
      />
    </svg>
  );
};

export default DataIcon;
