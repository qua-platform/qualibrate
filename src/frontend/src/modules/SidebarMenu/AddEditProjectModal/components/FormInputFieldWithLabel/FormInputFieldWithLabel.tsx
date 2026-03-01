import React, { ChangeEvent } from "react";
import styles from "./FormInputFieldWithLabel.module.scss";
import { InfoIcon } from "../../../../../components";

interface Props {
  dataTestId?: string;
  classNames?: string;
  labelText: string;
  subLabelText?: string;
  tooltipText?: string;
  placeholder: string;
  inputType: "text" | "password" | "number";
  value: string | number;
  isDisabled: boolean;
  isRequired: boolean;
  handleChange: (e: ChangeEvent<HTMLInputElement>) => void;
}

const FormInputFieldWithLabel = ({
  dataTestId,
  classNames,
  labelText,
  subLabelText,
  tooltipText,
  placeholder,
  inputType,
  value,
  isDisabled,
  isRequired,
  handleChange,
}: Props) => {
  return (
    <div data-testid={dataTestId} className={classNames ?? ""}>
      <label>
        {labelText}
        {tooltipText ? (
          <span className={styles.tooltipIcon} title={tooltipText}>
            <InfoIcon width={12} height={12} />
          </span>
        ) : null}
        {subLabelText ? <span className={styles.subLabel}>{subLabelText}</span> : null}
        {isRequired && <span className={styles.required}>*</span>}
      </label>
      <input
        data-testid={`${dataTestId}-input`}
        type={inputType}
        value={value}
        disabled={isDisabled}
        onChange={handleChange}
        placeholder={placeholder}
        required={isRequired}
      />
    </div>
  );
};

export default FormInputFieldWithLabel;
