import React from "react";

import styles from "./Checkbox.module.scss";
import { classNames } from "../../../utils/classnames";
import CheckIcon from "./CheckIcon";
import { BACKGROUND_COLOR } from "../../../utils/colors";

export interface CheckBoxProps {
  checked: boolean;
  onChange: (value: boolean) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}
const CheckBox: React.FC<CheckBoxProps> = (props) => {
  const { checked, onChange, placeholder, disabled, className, ...restProps } = props;
  return (
    <button
      className={classNames(styles.checkBoxContainer, className, disabled && styles.disabled)}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      data-cy="CheckBox"
      {...restProps}
    >
      <div className={classNames(styles.checkBoxBox, checked && styles.checked)}>
        <div className={styles.checkBoxCheckedBox}>
          <CheckIcon color={BACKGROUND_COLOR} />
        </div>
      </div>
      {placeholder && <div className={styles.checkBoxPlaceholder}>{placeholder}</div>}
    </button>
  );
};

export default CheckBox;
