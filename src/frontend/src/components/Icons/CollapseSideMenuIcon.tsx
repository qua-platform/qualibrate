import React from "react";

const CollapseSideMenuIcon: React.FC = () => {
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
        d="M9.26278 8L16 15.3441L15.3154 16L7.97648 8L15.3154 0L16 0.655904L9.26278 8Z"
        fill="var(--grey-highlight)"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M1.2863 8L8.02352 15.3441L7.33892 16L0 8L7.33892 0L8.02352 0.655904L1.2863 8Z"
        fill="var(--grey-highlight)"
      />
    </svg>
  );
};

export default CollapseSideMenuIcon;
