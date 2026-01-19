import React from "react";

interface Props {
  width?: number;
  height?: number;
}

const NoGraphRunningIcon: React.FC<Props> = ({ width = 28, height = 28 }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      viewBox="0 0 28 28"
      fill="none"
    >
      <path
        opacity="0.5"
        d="M20.5 20.5L16.6765 16.6765M11.3235 11.3235L7.5 7.5M19.3529 23.1765C19.3529 25.2881 21.0648 27 23.1765 27C25.2881 27 27 25.2881 27 23.1765C27 21.0648 25.2881 19.3529 23.1765 19.3529C21.0648 19.3529 19.3529 21.0648 19.3529 23.1765ZM10.1765 14C10.1765 16.1117 11.8883 17.8235 14 17.8235C16.1117 17.8235 17.8235 16.1117 17.8235 14C17.8235 11.8883 16.1117 10.1765 14 10.1765C11.8883 10.1765 10.1765 11.8883 10.1765 14ZM1 4.82353C1 6.93521 2.71185 8.64706 4.82353 8.64706C6.93521 8.64706 8.64706 6.93521 8.64706 4.82353C8.64706 2.71185 6.93521 1 4.82353 1C2.71185 1 1 2.71185 1 4.82353Z"
        stroke="#A5ACB6"
        strokeWidth="1.6"
      />
    </svg>
  );
};

export default NoGraphRunningIcon;
