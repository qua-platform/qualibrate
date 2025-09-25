import React from "react";
import { JSONEditor } from "../../../Data/components/JSONEditor";
import styles from "./Results.module.scss";
import { ModuleKey } from "../../../../routing/ModulesRegistry";
import ErrorIcon from "../../../../ui-lib/Icons/ErrorIcon";
import { ErrorObject } from "../../../common/Error/ErrorStatusWrapper";

export const ResultsError: React.FC<{ style?: React.CSSProperties; errorObject: ErrorObject }> = ({ style, errorObject }) => {
  return (
    <div className={styles.errorWrapper} style={style} data-testid="results-wrapper">
      <div className={styles.errorHeader}>
        <div className={styles.errorIcon}>
          <ErrorIcon height={20} width={20} />
        </div>
        <div className={styles.errorHeaderTitle}>Error</div>
      </div>
      <div className={styles.errorContent}>
        <div>
          <div className={styles.errorLabel}>Error occurred:</div>
          <div className={styles.errorText}>{errorObject.message}</div>
        </div>
        <div>
          <div className={styles.errorLabel}>Error traceback:</div>
          <div className={styles.errorText}>
            {(errorObject.traceback ?? []).map((row, index) => (
              <div key={`${row}-${index}`}>{row}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export const Results: React.FC<{
  title?: string;
  jsonObject: object;
  showSearch?: boolean;
  toggleSwitch?: boolean;
  pageName?: ModuleKey;
  errorObject: ErrorObject | null | undefined;
  style?: React.CSSProperties;
}> = ({ title, jsonObject, showSearch = true, toggleSwitch = false, pageName, style, errorObject }) => {
  if (errorObject) {
    return <ResultsError style={style} errorObject={errorObject} />;
  }

  return (
    <div className={styles.wrapper} style={style} data-testid="results-wrapper">
      <JSONEditor
        title={title ?? "Results"}
        jsonDataProp={jsonObject}
        height={"100%"}
        showSearch={showSearch}
        toggleSwitch={toggleSwitch}
        pageName={pageName}
      />
    </div>
  );
};
