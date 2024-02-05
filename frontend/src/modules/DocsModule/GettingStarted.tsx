import { DOCS_GETTING_STARTED_MODULE_URL } from "../../DEPRECATED_common/modules";
import React from "react";
import styles from "./Docs.module.scss";

const GettingStarted = () => {
  return <iframe src={DOCS_GETTING_STARTED_MODULE_URL} className={styles.docs} />;
};

export default GettingStarted;
