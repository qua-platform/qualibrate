import React, { ChangeEvent } from "react";

export enum IconType {
  INNER = "INNER",
}

export type InputProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange"> & {
  onChange?: (val: string, e: ChangeEvent<HTMLInputElement>) => void;
  name?: string;
  inputClassName?: string;
  icon?: React.ReactElement;
  typeOfField?: string;
  error?: string | undefined;
  label?: string;
  fieldName?: string;
  newLineBetween?: boolean;
  iconType?: IconType;
};
