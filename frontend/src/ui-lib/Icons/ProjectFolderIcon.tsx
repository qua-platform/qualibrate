import React from "react";

interface Props {
  initials: string;
  width?: number;
  height?: number;
  fillColor?: string;
  textColor?: string;
  fontSize?: number;
}

const ProjectFolderIcon: React.FC<Props> = ({
  initials,
  width = 36,
  height = 36,
  fillColor = "#5175BD",
  textColor = "#FFFFFF",
  fontSize = 14,
}) => {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 30 30"
    >
      {/* Folder back tab */}
      <path opacity="0.4" d="M4 6C4 3.79086 5.79086 2 8 2H25C27.2091 2 29 3.79086 29 6H4Z" fill={fillColor} />
      {/* Folder tab lip */}
      <path opacity="0.2" d="M4 2C4 0.895431 4.89543 0 6 0H20C21.1046 0 22 0.895431 22 2H4Z" fill={fillColor} />
      {/* Main folder body */}
      <path d="M0 4C0 1.79086 1.79086 0 4 0H6.3915C7.08108 0 7.72202 0.355239 8.0875 0.940002L9.4125 3.06C9.77798 3.64476 10.4189 4 11.1085 4H26C28.2091 4 30 5.79086 30 8V26C30 28.2091 28.2091 30 26 30H4C1.79086 30 0 28.2091 0 26V4Z" fill={fillColor} />

      {/* Centered initials */}
      <text
        x="15"
        y="20"
        textAnchor="middle"
        fill={textColor}
        fontSize={fontSize}
        fontWeight="bold"
        fontFamily="Arial, sans-serif"
      >
        {initials}
      </text>
    </svg>
  );
};

export default ProjectFolderIcon;