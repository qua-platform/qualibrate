import React from "react";

import { classNames } from "../../../utils/classnames";
import styles from "./TextButton.module.scss";
import { DefaultButtonProps } from "./types";

export type BlueButtonProps = DefaultButtonProps & {
  text: string;
};

const TextButton: React.FC<BlueButtonProps> = (props) => {
  const { className, text, ...restProps } = props;
  return (
    <button className={classNames(styles.textButton, className)} {...restProps}>
      {text}
    </button>
  );
};

export default TextButton;
