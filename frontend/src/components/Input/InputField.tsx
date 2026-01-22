import React, { ChangeEvent, ChangeEventHandler } from "react";
// eslint-disable-next-line css-modules/no-unused-class
import styles from "./Input.module.scss";
import { classNames } from "../../utils/classnames";

export enum IconType {
  INNER = "INNER"
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

const InputField = (props: InputProps) => {
  const {
    name = "",
    value,
    onChange,
    typeOfField,
    className,
    error,
    icon,
    label,
    iconType,
    inputClassName: inputCN,
    disabled = false,
    ...restProps
  } = props;
  const handleChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    if (onChange) {
      onChange(event.target.value, event);
    }
  };

  const inputClassName = classNames(styles.input, error && styles.error, inputCN, disabled && styles.disabledInput);

  return (
    <div className={classNames(styles.inputWrapper, icon && styles.withIcon, className)}>
      {(label || icon) && (
        <div className={styles.labelWrapper}>
          {label && <label className={styles.label}>{label}</label>}
          {icon && <div className={classNames(styles.inputIcon, iconType === IconType.INNER && styles.inputIcon_inner)}>{icon}</div>}
        </div>
      )}
      <input
        name={name}
        autoComplete={"new-password"}
        className={inputClassName}
        value={value}
        onChange={handleChange}
        type={typeOfField === "password" ? "password" : "text"}
        placeholder={props.placeholder ?? "Enter a value"}
        disabled={props.disabled}
        {...restProps}
      />
      <div className={styles.errorMsg}>{error}</div>
    </div>
  );
};

export default InputField;