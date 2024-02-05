import React, { PropsWithChildren } from "react";
import styles from "./LabelWrap.module.scss";
import { classNames } from "../../../utils/classnames";

type LabelProps = {
  text: string;
  withBottomMargin?: boolean;
  withUpperMargin?: boolean;
};
const LabelWrap = ({ text, children, withBottomMargin, withUpperMargin }: PropsWithChildren<LabelProps>) => {
  return (
    <div className={classNames(withBottomMargin && styles.btmMargin, withUpperMargin && styles.uprMargin)}>
      <div className={styles.label}>{text}</div>
      {children}
    </div>
  );
};

export default LabelWrap;
