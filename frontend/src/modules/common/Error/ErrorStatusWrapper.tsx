import React from "react";
import styles from "../Error/ErrorStatusWrapper.module.scss";

export interface ErrorObject {
  error_class: string;
  message: string;
  traceback?: string[];
}

export const ErrorStatusWrapper: React.FC<{
  error: ErrorObject | undefined;
}> = (props) => {
  const { error } = props;
  let errorMessage = error?.error_class;
  if (errorMessage) {
    errorMessage += ": ";
  }
  if (error?.message) {
    errorMessage += error?.message;
  }

  return (
    <>
      <div className={styles.statusErrorWrapper}>
        {error?.error_class && <div>Error occurred:</div>}
        <div className={styles.statusErrorWrapper}> {errorMessage}</div>
        {error?.traceback?.length && error?.traceback?.length > 0 && <div>Error traceback:</div>}
        {(error?.traceback ?? []).map((row, index) => (
          <div key={`${row}-${index}`} className={styles.statusErrorRowWrapper}>
            {row}
          </div>
        ))}
      </div>
    </>
  );
};
