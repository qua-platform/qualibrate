import React from "react";
import { InputField } from "../../../../../components";

type IdInputFieldProps = {
  onChange: (value: string) => void;
  onEnter?: () => void;
  onFocus?: () => void;
  onConfirm?: (value: string, isFirstId: boolean) => void;
  value: string;
  isFirstId?: boolean;
  disabled: boolean;
};

export const IdInputField: React.FC<IdInputFieldProps> = ({ onChange, onConfirm, value, isFirstId, disabled, onFocus }) => (
  <InputField
    disabled={disabled}
    value={value}
    placeholder=""
    onChange={onChange}
    onFocus={onFocus}
    onKeyDown={(e) => {
      if (e.key === "Enter" && onConfirm) {
        onConfirm((e.target as HTMLInputElement).value, !!isFirstId);
      }
    }}
  />
);
