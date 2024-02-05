import { ButtonTypes } from "./ButtonTypes";
import { PopupTypes } from "../DEPRECATED_enum/PopupTypes";
import React from "react";
import { MinifyProp } from "../../types";

export type ButtonProps = {
  icon?: React.ReactElement;
  iconSide?: "LEFT" | "RIGHT";
  actionName?: string;
  onClickCallback?: () => void;
  type?: ButtonTypes;
  customClassName?: string;
  textColor?: string;
  onSubmitType?: "button" | "reset" | "submit";
  hideText?: boolean;
  sortButton?: boolean;
  showPopup?: PopupTypes;
  disabled?: boolean;
  iconRotation?: number;
} & MinifyProp;
