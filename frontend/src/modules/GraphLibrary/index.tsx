import React, { useEffect } from "react";
// eslint-disable-next-line css-modules/no-unused-class
import styles from "./GraphLibrary.module.scss";
import { GraphContextProvider, useGraphContext } from "./context/GraphContext";
import { GraphList } from "./components/GraphList";
import { SelectionContextProvider } from "../common/context/SelectionContext";
import { useFlexLayoutContext } from "../../routing/flexLayout/FlexLayoutContext";
import BlueButton from "../../ui-lib/components/Button/BlueButton";

export const GraphLibrary = () => {
  const { fetchAllCalibrationGraphs } = useGraphContext();
  const { topBarAdditionalComponents, setTopBarAdditionalComponents } = useFlexLayoutContext();
  const GraphLibraryTopBarRefreshButton = () => {
    return (
      <div className={styles.buttonWrapper}>
        <BlueButton onClick={() => fetchAllCalibrationGraphs(true)}>Refresh</BlueButton>
      </div>
    );
  };
  useEffect(() => {
    setTopBarAdditionalComponents({ ...topBarAdditionalComponents, "graph-library": <GraphLibraryTopBarRefreshButton /> });
  }, []);
  return (
    <div className={styles.wrapper}>
      <div className={styles.nodesContainer}>
        <GraphList />
      </div>
    </div>
  );
};

export default () => (
  <GraphContextProvider>
    <SelectionContextProvider>
      <GraphLibrary />
    </SelectionContextProvider>
  </GraphContextProvider>
);
