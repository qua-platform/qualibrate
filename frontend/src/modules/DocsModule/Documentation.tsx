import { DOCS_MODULE_URL } from "../../DEPRECATED_common/modules";
import React from "react";
import styles from "./Docs.module.scss";
import useUrlState, { UrlState } from "../Experiments/CodeModule/useUrlState";
import LoaderPage from "../../ui-lib/loader/LoaderPage";

const Documentation = () => {
  const [urlState] = useUrlState(DOCS_MODULE_URL);
  if (urlState !== UrlState.EXIST) {
    return <LoaderPage />;
  }
  return <iframe src={DOCS_MODULE_URL} className={styles.docs} />;
};

export default Documentation;
