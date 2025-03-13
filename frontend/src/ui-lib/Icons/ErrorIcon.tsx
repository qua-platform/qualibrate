import React from "react";

interface ErrorIconProps {
  className?: string;
}

const ErrorIcon: React.FC<ErrorIconProps> = ({ className }) => {
  return (
    <svg
      className={className}
      width="30" // TODO: change to default parameters in signature and remove from here (only width and hight) check other icons for reference 
      height="30"
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="20" cy="20" r="18" stroke="#BF4E4E" strokeWidth="3" fill="#3A1E1E" />
      <line x1="20" y1="11" x2="20" y2="23" stroke="#FF7373" strokeWidth="3" strokeLinecap="round" />
      <circle cx="20" cy="29" r="2" fill="#FF7373" />
    </svg>
  );
};

export default ErrorIcon;
