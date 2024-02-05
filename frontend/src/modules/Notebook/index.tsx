import React from "react";
import { NOTEBOOK_URL } from "../../DEPRECATED_common/modules";

import styles from "./Notebook.module.scss";

const Notebook = () => {
  return <iframe src={NOTEBOOK_URL} className={styles.notebook}></iframe>;
};

export default Notebook;
