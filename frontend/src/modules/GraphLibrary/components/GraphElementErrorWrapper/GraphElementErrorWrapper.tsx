/**
 * @fileoverview Collapsible error display for graph execution failures.
 *
 * Auto-expands when error appears, shows JSON-stringified error object.
 * Used in GraphElement to display API submission errors.
 */
import styles from "../GraphElementErrorWrapper/GraphElementErrorWrapper.module.scss";
import { ArrowIcon } from "../../../../components";
import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { getErrorObject } from "../../../../stores/GraphStores/GraphLibrary";

export const GraphElementErrorWrapper: React.FC = () => {
  const errorObject = useSelector(getErrorObject);
  const [expanded, setExpanded] = React.useState<boolean>(!!errorObject);

  // Auto-expand when error appears, collapse when cleared
  useEffect(() => {
    if (errorObject) {
      setExpanded(true);
    } else {
      setExpanded(false);
    }
  }, [errorObject]);

  return (
    <div className={styles.wrapper}>
      {errorObject !== undefined && (
        <div className={styles.titleAndIconWrapper}>
          <div
            className={styles.arrowIconWrapper}
            onClick={() => {
              setExpanded(!expanded);
            }}
          >
            <ArrowIcon options={{ rotationDegree: expanded ? 0 : -90 }} />
          </div>
          {"Error"}
        </div>
      )}
      {expanded && <div className={styles.errorObjectWrapper}>{JSON.stringify(errorObject)}</div>}
    </div>
  );
};
