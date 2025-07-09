import React from "react";

const ExpandSideMenuIcon: React.FC = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      style={{ width: "16px", height: "16px", flexShrink: 0 }}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M6.73722 8L0 0.655904L0.684604 0L8.02352 8L0.684604 16L0 15.3441L6.73722 8Z"
        fill="var(--grey-highlight)"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M14.7137 8L7.97648 0.655904L8.66108 0L16 8L8.66108 16L7.97648 15.3441L14.7137 8Z"
        fill="var(--grey-highlight)"
      />
    </svg>
  );
};

export default ExpandSideMenuIcon;
