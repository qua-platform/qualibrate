import { ChangeEvent, useCallback } from "react";

import { classNames } from "../../../utils/classnames";
import styles from "./Checkbox.module.scss";

type InputOnChangeType = ChangeEvent<HTMLInputElement>;

export type CheckBoxOnChangeType = (isChecked: boolean, ...extraArgs: any) => void;

interface CheckboxProps {
  onChange?: CheckBoxOnChangeType;
  isChecked?: boolean;
  className?: string;
  name?: string;
}
// TODO use this:
//  entropy_frontend_ui/src/ui-lib/components/Checkbox/Checkbox.tsx
const DEPRECATEDCheckbox = ({ onChange, isChecked = false, className, name }: CheckboxProps) => {
  const handleOnChange = useCallback(
    (event: InputOnChangeType) => {
      onChange && onChange(event.target.checked, name);
    },
    [onChange]
  );

  return (
    <input
      name={name || "checkbox"}
      type="checkbox"
      checked={isChecked}
      onChange={handleOnChange}
      className={classNames(styles.checkbox, className)}
    />
  );
};

export default DEPRECATEDCheckbox;
