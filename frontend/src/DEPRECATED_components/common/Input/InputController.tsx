import React from "react";

import InputField from "./InputField";
import { InputProps } from "../../../DEPRECATED_common/DEPRECATED_interfaces/InputProps";
import { InputTypes } from "../../../DEPRECATED_common/DEPRECATED_interfaces/InputTypes";
import SelectField from "./SelectField";
import { SelectProps } from "../../../DEPRECATED_common/DEPRECATED_interfaces/SelectProps";
import { classNames } from "../../../utils/classnames";
// eslint-disable-next-line css-modules/no-unused-class
import styles from "./Input.module.scss";
import useSwitch from "@react-hook/switch";

interface Props extends InputProps, SelectProps {
  ref?: React.RefObject<HTMLInputElement>;
  fieldIcon?: React.ReactElement;
  fieldName?: string;
  lockOnValue?: string | boolean | number;
  lockValueDescription?: string;
  inputIsLocked?: boolean;
  label?: string;
  newLineBetween?: boolean;
}
// TODO
// use InputField this component is overcomplicated
const InputController = (props: Props) => {
  const { lockValueDescription, fieldName, fieldIcon, newLineBetween } = props;
  const [isLocked] = useSwitch(props.inputIsLocked);

  const getControllerStyles = () => {
    const classNames = [styles.inputField];
    if (props.type === InputTypes.SELECT) {
      classNames.push(styles.inputSelect);
    }
    if (newLineBetween) {
      classNames.push(styles.addBottomPadding);
    }

    return classNames.join(" ");
  };

  const containerClassName = classNames(
    styles.inputController,
    lockValueDescription && styles.inputControllerWithLock,
    fieldName && styles.withLabel,
    fieldIcon && styles.withIcon,
    newLineBetween && styles.newLineBetween
  );

  const renderInput = () => {
    switch (props.type) {
      case InputTypes.SELECT:
        return <SelectField {...props} name={props.fieldName} />;
      case InputTypes.PASSWORD:
        return <InputField {...props} type={InputTypes.PASSWORD} name={props.name ?? props.fieldName} />;
      default:
        return isLocked ? (
          <InputField {...props} name={props.name ?? props.fieldName} disabled />
        ) : (
          <InputField {...props} name={props.name ?? props.fieldName} />
        );
    }
  };

  const renderTitle = () => {
    return (
      (props.fieldIcon || props.fieldName) && (
        <div className={styles.inputTitle}>
          {props.fieldIcon && <div className={styles.inputIcon}>{props.fieldIcon}</div>}

          {props.name && !props.fieldName && <div className={styles.inputName}>{props.name}</div>}
          {!props.name && props.fieldName && <div className={styles.inputName}>{props.fieldName}</div>}
          {props.name && props.fieldName && <div className={styles.inputName}>{props.fieldName}</div>}
        </div>
      )
    );
  };

  // const onLockValue = (status: boolean) => {
  //   if (status) {
  //     toggleLock.on();
  //   } else {
  //     toggleLock.off();
  //   }
  // };

  return (
    <div className={containerClassName}>
      {renderTitle()}
      <div className={getControllerStyles()}>{renderInput()}</div>
    </div>
  );
};

export default InputController;
