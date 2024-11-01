import React from "react";
import styles from "../Error/ErrorStatusWrapper.module.scss";
import { ResponseStatusError } from "../../Nodes/context/NodesContext";

export const ErrorResponseWrapper: React.FC<{
  error: ResponseStatusError | undefined;
}> = (props) => {
  const { error } = props;
  let errorMessage = error?.name;
  if (errorMessage) {
    errorMessage += "";
  } else {
    errorMessage += "Error message: ";
  }
  if (error?.msg) {
    errorMessage += error?.msg;
  }

  return (
    <>
      {error && (
        <div className={styles.statusErrorWrapper}>
          {error?.name && <div>Error occurred:</div>}
          <div className={styles.statusErrorWrapper}> {errorMessage}</div>
        </div>
      )}
    </>
  );
};
