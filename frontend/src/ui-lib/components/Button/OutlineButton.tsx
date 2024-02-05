import React from "react";
import styles from "./OutlineButton.module.scss";
import { classNames } from "../../../utils/classnames";
import { DefaultButtonProps } from "./types";

export type BlueButtonProps = DefaultButtonProps;

const OutlineButton: React.FC<BlueButtonProps> = (props) => {
  const { className, children, disabled, isCircle, ...restProps } = props;
  return (
    <button
      className={classNames(styles.button, className, isCircle && styles.isCircle, disabled && styles.disabled)}
      disabled={disabled}
      {...restProps}
    >
      {children}
    </button>
  );
};

export default OutlineButton;
