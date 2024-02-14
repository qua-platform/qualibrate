import React, { ChangeEvent } from "react";
import { InputTypes } from "./InputTypes";

export enum IconType {
  INNER = "INNER",
  // UPPER = "UPPER",
}

export type InputProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange"> & {
  onChange?: (val: string, e: ChangeEvent<HTMLInputElement>) => void;
  name?: string;
  inputClassName?: string;
  icon?: React.ReactElement;
  type?: InputTypes;
  typeOfField?: string;
  error?: string | undefined;
  label?: string;
  fieldName?: string;
  newLineBetween?: boolean;
  iconType?: IconType;
};
