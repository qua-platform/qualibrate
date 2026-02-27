import React, { ChangeEvent } from "react";
import styles from "./FormInputFieldWithLabel.module.scss";
import { InfoIcon } from "../../../../../components";

interface Props {
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
    <div className={classNames ?? ""}>
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
        type={inputType}
        value={value}
        disabled={isDisabled}
        // onChange={(e) => handleChange(fieldName, e.target.value)}
        onChange={handleChange}
        placeholder={placeholder}
        required={isRequired}
      />
    </div>
  );
};

export default FormInputFieldWithLabel;
