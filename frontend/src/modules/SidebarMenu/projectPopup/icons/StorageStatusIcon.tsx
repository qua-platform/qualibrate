import React from "react";
import { IconProps } from "../../../../DEPRECATED_common/DEPRECATED_interfaces/IconProps";

function StorageStatusIcon({ isOk, color }: { isOk: boolean } & IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="35" height="38" fill="none" viewBox="0 0 35 38">
      {isOk && <circle cx="28" cy="7" r="7" fill={"#00D59A"}></circle>}
      {isOk && (
        <path
          fill={"var(--popup-background)"}
          fillRule="evenodd"
          d="M26.857 10L24 7.115l.8-.807 2.057 2.077L31.2 4l.8.808L26.857 10z"
          clipRule="evenodd"
        ></path>
      )}
      <path
        stroke={color || "var(--sub-text-color)"}
        strokeWidth="1.2"
        d="M22 19.4c0 2.43-4.477 4.4-10 4.4S2 21.83 2 19.4m20 0c0-2.43-4.477-4.4-10-4.4S2 16.97 2 19.4m20 0v13.2c0 2.43-4.477 4.4-10 4.4S2 35.03 2 32.6V19.4M22 26c0 2.43-4.477 4.4-10 4.4S2 28.43 2 26"
      ></path>
    </svg>
  );
}

export default StorageStatusIcon;
