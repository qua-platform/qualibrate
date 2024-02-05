import React, { HTMLProps } from "react";
import styles from "./ContentBox.module.scss";

export default function ContentBox(props: HTMLProps<any>): React.ReactElement {
  return <div className={styles.infoBody} {...props} />;
}
