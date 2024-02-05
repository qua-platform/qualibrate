import React from "react";
import { IconProps } from "../../../../DEPRECATED_common/DEPRECATED_interfaces/IconProps";

function ProjectStatusIcon({ isOk, color }: { isOk: boolean } & IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="35" height="37" fill="none" viewBox="0 0 35 37">
      <circle cx="16.998" cy="30" r="1" fill={color || "var(--sub-text-color)"}></circle>
      <path
        stroke={color || "var(--sub-text-color)"}
        d="M21.728 30.979a.538.538 0 01-.258-.525c.031-.311.03-.626-.004-.94a.537.537 0 01.253-.528l.783-.456a.5.5 0 00.18-.684l-1.004-1.726a.5.5 0 00-.684-.18l-.783.456a.537.537 0 01-.584-.04 4.502 4.502 0 00-.816-.468.538.538 0 01-.33-.483l-.003-.905a.5.5 0 00-.502-.498l-1.998.007a.5.5 0 00-.498.502l.004.906a.535.535 0 01-.327.484 4.3 4.3 0 00-.813.473.535.535 0 01-.582.046l-.786-.45a.5.5 0 00-.683.185l-.992 1.734a.5.5 0 00.185.683l.786.45a.538.538 0 01.258.525c-.032.311-.03.626.004.94.023.21-.07.42-.253.527l-.783.456a.5.5 0 00-.18.684l1.004 1.726a.5.5 0 00.684.18l.784-.456a.537.537 0 01.583.04c.256.185.529.342.815.467.194.086.33.272.33.484l.004.905a.5.5 0 00.501.498l1.998-.007a.5.5 0 00.498-.502l-.003-.905a.533.533 0 01.326-.484 4.313 4.313 0 00.815-.475.534.534 0 01.581-.045l.786.45a.5.5 0 00.682-.186l.993-1.733a.5.5 0 00-.186-.683l-.785-.449z"
      ></path>
      <path
        stroke={color || "var(--sub-text-color)"}
        strokeWidth="1.2"
        d="M20 22v-7.5a.5.5 0 00-.5-.5h-17a.5.5 0 00-.5.5v19a.5.5 0 00.5.5H9M5.398 23.45H10m-4.602-5h11.2"
      />
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

export default ProjectStatusIcon;
