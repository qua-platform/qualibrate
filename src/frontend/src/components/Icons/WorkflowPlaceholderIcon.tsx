import React from "react";
import { BACKGROUND_COLOR, MAIN_TEXT_COLOR } from "../../utils/colors";
import { IconProps } from "./IconProps";

export const WorkflowPlaceHolderIcon: React.FunctionComponent<IconProps> = ({ width = 373, height = 155, color = MAIN_TEXT_COLOR }) => (
  <svg width={width} height={height} viewBox="0 0 373 155" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path opacity="0.6" d="M173.5 81L298 126L357 16.5" stroke={color} strokeDasharray="2 2" />
    <path opacity="0.6" d="M71.5 79L101 16L173.5 85L239.5 32" stroke={color} strokeDasharray="2 2" />
    <circle cx="51" cy="105" r="21" fill={BACKGROUND_COLOR} stroke={color} strokeDasharray="2 2" />
    <path
      d="M116 16C116 24.2843 109.284 31 101 31C92.7157 31 86 24.2843 86 16C86 7.71573 92.7157 1 101 1C109.284 1 116 7.71573 116 16Z"
      fill={BACKGROUND_COLOR}
      stroke={color}
    />
    <path
      d="M189.5 82C189.5 90.2843 182.784 97 174.5 97C166.216 97 159.5 90.2843 159.5 82C159.5 73.7157 166.216 67 174.5 67C182.784 67 189.5 73.7157 189.5 82Z"
      fill={BACKGROUND_COLOR}
      stroke={color}
    />
    <path
      d="M313 124C313 132.284 306.284 139 298 139C289.716 139 283 132.284 283 124C283 115.716 289.716 109 298 109C306.284 109 313 115.716 313 124Z"
      fill={BACKGROUND_COLOR}
      stroke={color}
    />
    <path
      d="M84 105C84 123.225 69.2254 138 51 138C32.7746 138 18 123.225 18 105C18 86.7746 32.7746 72 51 72C69.2254 72 84 86.7746 84 105Z"
      stroke={color}
    />
    <path d="M25.5 126L1 150.5L4 153.5L28.5 129" stroke={color} />
    <path
      d="M372.5 16C372.5 24.2843 365.784 31 357.5 31C349.216 31 342.5 24.2843 342.5 16C342.5 7.71573 349.216 1 357.5 1C365.784 1 372.5 7.71573 372.5 16Z"
      fill={BACKGROUND_COLOR}
      stroke={color}
    />
    <path
      d="M254.5 32C254.5 40.2843 247.784 47 239.5 47C231.216 47 224.5 40.2843 224.5 32C224.5 23.7157 231.216 17 239.5 17C247.784 17 254.5 23.7157 254.5 32Z"
      fill={BACKGROUND_COLOR}
      stroke={color}
    />
  </svg>
);
