import React from "react";

import styles from "./Title.module.scss";

type Props = {
  title: string;
};
const Title: React.FunctionComponent<Props> = ({ title }) => {
  return <div className={styles.title}>{title}</div>;
};

export default Title;
