import React from "react";

import { classNames } from "../../utils/classnames";
import styles from "./BlueButton.module.scss";
import { DefaultButtonProps } from "./types";

type BlueButtonProps = DefaultButtonProps & {
  isSecondary?: boolean;
  isBig?: boolean;
};

const BlueButton: React.FC<BlueButtonProps> = (props) => {
  const { className, children, isSecondary, isBig, isCircle, ...restProps } = props;
  return (
    <button
      className={classNames(
        styles.blueButton,
        isBig && styles.big,
        isSecondary ? styles.secondary : styles.primary,
        isCircle && styles.isCircle,
        className
      )}
      {...restProps}
    >
      {children}
    </button>
  );
};

export default BlueButton;
