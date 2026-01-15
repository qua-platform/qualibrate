import React from "react";

interface CheckmarkIconProps extends React.SVGProps<SVGSVGElement> {}

const CheckmarkIcon: React.FC<CheckmarkIconProps> = ({
  width = 38,
  height = 38,
  className,
  ...props
}) => {
  return (
    <svg
      className={className}
      width={width}
      height={height}
      viewBox="0 0 38 38"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <circle
        cx="19"
        cy="19"
        r="18"
        stroke="#32FFC6"
        strokeWidth="2"
        opacity="0.3"
        vectorEffect="non-scaling-stroke"
      />
      <path
        d="M13 20.4L17 24L27 15"
        stroke="#32FFC6"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
};

export default CheckmarkIcon;
