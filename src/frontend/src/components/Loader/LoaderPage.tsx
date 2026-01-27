import React from "react";
import styles from "./LoaderPage.module.scss";
import Loader from "./Loader";

export default function LoaderPage({ text }: { text?: string }): React.ReactElement {
  return (
    <div className={styles.container}>
      <Loader />
      {text && <div className={styles.text}>{text}</div>}
    </div>
  );
}
