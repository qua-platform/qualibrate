import React from "react";
import { DASHBOARD_URL } from "../../DEPRECATED_common/modules";

import styles from "./Dashboard.module.scss";
import useUrlState, { UrlState } from "../Experiments/CodeModule/useUrlState";
import LoaderPage from "../../ui-lib/loader/LoaderPage";

const index = () => {
  const [urlState] = useUrlState(DASHBOARD_URL);
  if (urlState !== UrlState.EXIST) {
    return <LoaderPage />;
  }
  return <iframe src={DASHBOARD_URL} className={styles.dashboard}></iframe>;
};

export default index;
