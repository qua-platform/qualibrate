import { NavItemProps } from "./NavItemProps";
import React from "react";

export interface NavigatedPanel {
  id?: number | string;
  nav: NavItemProps;
  panel?: React.ReactNode;
  onClick?: () => void;
  active?: boolean;
  actions?: React.ReactElement[];
}
