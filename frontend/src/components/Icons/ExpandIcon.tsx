import React from "react";
import { IconProps } from "./IconProps";

const ExpandIcon: React.FunctionComponent<IconProps> = (props) =>
  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="8" viewBox="0 0 12 8" fill="none" {...props}>
    <path d="M1 1L6 6L11 1" stroke="#7d8590" strokeWidth="2" strokeLinecap="round"/>
  </svg>;

export default ExpandIcon;