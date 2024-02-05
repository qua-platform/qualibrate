import React from "react";

import styles from "./SubTitle.module.scss";
import { CopyButton } from "../../../../../ui-lib/components/Button/CopyButton";

type Props = {
  text: string;
  configRoute?: string;
};
const SubTitle: React.FunctionComponent<Props> = ({ text, configRoute }) => {
  return (
    <div className={styles.title}>
      {text}
      {configRoute && (
        <div className={styles.routeRow}>
          <span className={styles.routeTitle}>Route for getting configs: </span>
          <span className={styles.copyBox}>
            <span>{configRoute}</span>
            <CopyButton value={configRoute} hideLabel />
          </span>
        </div>
      )}
    </div>
  );
};

export default SubTitle;
