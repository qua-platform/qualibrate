import { ButtonTypes } from "./ButtonTypes";
import { PopupTypes } from "../enums/PopupTypes";
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
  disabled?: boolean;
  iconRotation?: number;
} & MinifyProp;
