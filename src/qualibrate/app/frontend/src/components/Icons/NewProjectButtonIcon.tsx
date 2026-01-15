import React from "react";

interface NewProjectButtonIconProps {
  width?: number;
  height?: number;
}

const NewProjectButtonIcon: React.FC<NewProjectButtonIconProps> = ({
  width = 160,
  height = 38,
}) => {
  return (
    <svg width={width} height={height} viewBox="0 0 160 38" fill="none" >
      <rect width="160" height="38" rx="19" fill="rgba(0, 147, 128, 0.6)" />
      <path d="M26.583 17.917H32V20.083H26.583V25.5H24.417V20.083H19V17.917H24.417V12.5H26.583V17.917Z" fill="white" />
      <text x="40" y="24" fill="white" fontSize="15" fontWeight="bold" fontFamily="Arial, sans-serif" >
        Create Project
      </text>
    </svg>
  );
};

export default NewProjectButtonIcon;
