import React, { useCallback, useEffect } from "react";
// eslint-disable-next-line css-modules/no-unused-class
import styles from "./GraphLibrary.module.scss";
import { GraphList } from "./components/GraphList";
import BlueButton from "../../ui-lib/components/Button/BlueButton";
import { CircularProgress } from "@mui/material";
import { fetchAllCalibrationGraphs } from "../../stores/GraphStores/GraphLibrary/actions";
import { getIsRescanningGraphs } from "../../stores/GraphStores/GraphLibrary/selectors";
import { useRootDispatch } from "../../stores";
import { useSelector } from "react-redux";
import { getTopBarAdditionalComponents } from "../../stores/NavigationStore/selectors";
import { setTopBarAdditionalComponents } from "../../stores/NavigationStore/actions";

export const GraphLibrary = () => {
  const dispatch = useRootDispatch();
  const topBarAdditionalComponents = useSelector(getTopBarAdditionalComponents);
  const isRescanningGraphs = useSelector(getIsRescanningGraphs);

  const GraphLibraryTopBarRefreshButton = () => {
    const onClickHandler = useCallback(() => dispatch(fetchAllCalibrationGraphs(true)), [fetchAllCalibrationGraphs]);
    return (
      <div className={styles.buttonWrapper}>
        <BlueButton onClick={onClickHandler}>Refresh</BlueButton>
      </div>
    );
  };
  useEffect(() => {
    dispatch(setTopBarAdditionalComponents({
      ...topBarAdditionalComponents,
      "graph-library": <GraphLibraryTopBarRefreshButton />,
    }));
  }, []);
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
