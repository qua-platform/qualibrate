import React from "react";
import { IconProps } from "../../common/interfaces/IconProps";
import { BLUE_BUTTON } from "../../utils/colors";

export default function QuestionMarkIcon({ width = 22, height = 22, color = BLUE_BUTTON }: IconProps): React.ReactElement {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={width} height={height} fill="none" viewBox="0 0 22 22">
      <g>
        <circle cx="11" cy="11" r="8.4" stroke={color} strokeWidth="1.2"></circle>
        <path
          fill={color}
          d="M11.65 13.285h-1.494a32.509 32.509 0 01-.006-.392c0-.485.08-.883.24-1.196.16-.312.481-.664.962-1.054.48-.391.767-.647.86-.768.145-.191.218-.402.218-.633 0-.32-.13-.594-.387-.82-.254-.23-.598-.346-1.031-.346-.418 0-.768.12-1.05.358-.28.238-.474.601-.58 1.09l-1.51-.188c.042-.7.339-1.293.89-1.781.554-.489 1.281-.733 2.18-.733.945 0 1.697.248 2.255.744.559.493.838 1.067.838 1.723 0 .363-.103.707-.31 1.031-.204.325-.641.766-1.313 1.325-.348.289-.564.521-.65.697-.082.176-.12.49-.112.943zM10.156 15.5v-1.646h1.647V15.5h-1.647z"
        ></path>
      </g>
    </svg>
  );
}
