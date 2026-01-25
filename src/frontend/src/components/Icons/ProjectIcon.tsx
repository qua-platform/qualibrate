import React from "react";

const ProjectIcon: React.FC<{ width?: number; height?: number; className?: string }> = ({
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
      viewBox="0 0 24 24"
      fill="none"
    >
      <rect
        x="2"
        y="11"
        width="20"
        height="10"
        rx="2"
        stroke="#fff"
        strokeWidth="1.2"
      />
      <path
        d="M4 11V9C4 7.89543 4.89543 7 6 7H18C19.1046 7 20 7.89543 20 9V11"
        stroke="#fff"
        strokeWidth="1.2"
      />
      <path
        d="M7 7V6C7 4.89543 7.89543 4 9 4H15C16.1046 4 17 4.89543 17 6V7"
        stroke="#fff"
        strokeWidth="1.2"
      />
    </svg>
  );
};

export default ProjectIcon;
