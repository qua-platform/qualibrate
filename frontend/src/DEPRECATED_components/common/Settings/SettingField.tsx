import React, { useCallback } from "react";

import DEPRECATEDButton from "../../buttons/ButtonWrapper";
import { ButtonTypes } from "../../../DEPRECATED_common/DEPRECATED_interfaces/ButtonTypes";
import { classNames } from "../../../utils/classnames";
import styles from "./SettingField.module.scss";

type SettingValue = string | number | React.ReactElement;

export enum Size {
  SMALL = "small",
  // LARGE = "large",
}

interface Props {
  description: string;
  value?: SettingValue;
  valueSize?: Size;
  icon?: React.ReactElement;
  disableChange?: boolean;
  changeCallback: () => void;
  changeButtonName?: string;
  className?: string;
}
const SettingField = ({
  description,
  value,
  icon,
  valueSize = Size.SMALL,
  disableChange = false,
  changeCallback,
  changeButtonName = "Change",
}: Props) => {
  const renderIcon = useCallback(() => {
    return icon ? <div className={styles.icon}>{icon}</div> : <></>;
  }, [icon]);

  const renderValue = useCallback(() => {
    return value ? <div className={classNames(styles.value, styles[valueSize])}>{value}</div> : <></>;
  }, [value]);

  const renderButton = useCallback(() => {
    return (
      !disableChange && (
        <DEPRECATEDButton
          actionName={changeButtonName}
          type={ButtonTypes.PLAIN}
          customClassName={styles.changeButton}
          onClickCallback={changeCallback}
        />
      )
    );
  }, [disableChange, changeCallback, changeButtonName]);

  return (
    <div className={styles.wrapper}>
      <div className={classNames(styles.description)}>{description}</div>
      <div className={styles.valueField}>
        {renderIcon()}
        {renderValue()}
      </div>
      {renderButton()}
    </div>
  );
};

export default SettingField;
