import React from "react";
import styles from "./styles/LogWrapper.module.scss";

const LogWrapper: React.FunctionComponent = ({ children, ...restProps }) => {
  return (
    <div className={styles.wrapper} {...restProps}>
      {children}
    </div>
  );
};

export default LogWrapper;
