import React from "react";
// eslint-disable-next-line css-modules/no-unused-class
import styles from "./GraphLibrary.module.scss";
import { GraphList } from "./components/GraphList";
import { CircularProgress } from "@mui/material";
import { getIsRescanningGraphs } from "../../stores/GraphStores/GraphLibrary/selectors";
import { useSelector } from "react-redux";

export const GraphLibrary = () => {
  const isRescanningGraphs = useSelector(getIsRescanningGraphs);

  return (
    <div className={styles.wrapper}>
      <div className={styles.nodesContainer}>
        {isRescanningGraphs && (
          <div className={styles.loadingContainer}>
            <CircularProgress size={32} />
            Graph library scan in progress
            <div>
              See <span className={styles.logsText}>LOGS</span> for details (bottomright)
            </div>
          </div>
        )}
        <GraphList />
      </div>
    </div>
  );
};

export default GraphLibrary
