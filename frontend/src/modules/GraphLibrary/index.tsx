import React, { useCallback, useEffect } from "react";
// eslint-disable-next-line css-modules/no-unused-class
import styles from "./GraphLibrary.module.scss";
import { useGraphContext } from "./context/GraphContext";
import { GraphList } from "./components/GraphList";
import { SelectionContextProvider } from "../common/context/SelectionContext";
import { useFlexLayoutContext } from "../../routing/flexLayout/FlexLayoutContext";
import BlueButton from "../../ui-lib/components/Button/BlueButton";
import { CircularProgress } from "@mui/material";

export const GraphLibrary = () => {
  const { fetchAllCalibrationGraphs, isRescanningGraphs } = useGraphContext();
  const { topBarAdditionalComponents, setTopBarAdditionalComponents } = useFlexLayoutContext();
  const GraphLibraryTopBarRefreshButton = () => {
    const onClickHandler = useCallback(() => fetchAllCalibrationGraphs(true), [fetchAllCalibrationGraphs]);
    return (
      <div className={styles.buttonWrapper}>
        <BlueButton onClick={onClickHandler}>Refresh</BlueButton>
      </div>
    );
  };
  useEffect(() => {
    setTopBarAdditionalComponents({
      ...topBarAdditionalComponents,
      "graph-library": <GraphLibraryTopBarRefreshButton />,
    });
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

export default () => (
  <SelectionContextProvider>
    <GraphLibrary />
  </SelectionContextProvider>
);
