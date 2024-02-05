import * as React from "react";
import { ReactElement } from "react";
import { MAIN_TEXT_COLOR } from "../../../utils/colors";

function CheckIcon({ color }: { color?: string }): ReactElement {
  const fill = color || MAIN_TEXT_COLOR;
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="8" viewBox="0 0 12 8" fill="none">
      <path fill={fill} fillRule="evenodd" d="M4.286 8L0 4.154l1.2-1.077 3.086 2.77L10.8 0 12 1.077 4.286 8z" clipRule="evenodd" />
    </svg>
  );
}

export default CheckIcon;
