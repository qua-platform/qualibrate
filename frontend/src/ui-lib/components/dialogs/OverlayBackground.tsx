import React, { CSSProperties } from "react";
import styles from "./OverlayBackground.module.scss";
import { classNames } from "../../../utils/classnames";

interface Props {
  isBlocking?: boolean;
  children: Array<React.ReactElement> | React.ReactElement;
  style?: CSSProperties;
}

export default function OverlayBackground(props: Props): React.ReactElement {
  const { children, isBlocking, style } = props;

  return (
    <div className={styles.container}>
      <div className={classNames(styles.background, isBlocking && styles.blocking)} style={style} />
      {children}
    </div>
  );
}
