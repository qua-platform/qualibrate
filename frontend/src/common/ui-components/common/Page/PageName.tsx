import React from "react";
// eslint-disable-next-line css-modules/no-unused-class
import styles from "./Page.module.scss";

interface Props {
  children: string;
}

const PageName = ({ children }: Props) => {
  return <h1 className={styles.pageName}>{children}</h1>;
};

export default PageName;
