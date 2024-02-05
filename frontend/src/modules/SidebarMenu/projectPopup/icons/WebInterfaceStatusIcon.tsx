import React from "react";
import { IconProps } from "../../../../DEPRECATED_common/DEPRECATED_interfaces/IconProps";

function WebInterfaceStatusIcon({ isOk, color }: { isOk: boolean } & IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="35" height="38" fill="none" viewBox="0 0 35 38">
      <rect width="20" height="20" x="2" y="17" stroke={color || "var(--sub-text-color)"} strokeWidth="1.2" rx="0.5"></rect>
      <path stroke={color || "var(--sub-text-color)"} strokeWidth="1.2" d="M2 23l20-.1M5.4 27.45h13.2M5.4 32.4h13.2" />
      <circle cx="5.2" cy="19.9" r="1" fill="#C6CDD6" />
      {isOk && <circle cx="28" cy="7" r="7" fill={"#00D59A"} />}
      {isOk && (
        <path
          fill={"var(--popup-background)"}
          fillRule="evenodd"
          d="M26.857 10L24 7.115l.8-.807 2.057 2.077L31.2 4l.8.808L26.857 10z"
          clipRule="evenodd"
        />
      )}
    </svg>
  );
}

export default WebInterfaceStatusIcon;
