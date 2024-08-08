import React from "react";
// eslint-disable-next-line css-modules/no-unused-class
import styles from "../CalibrationGraph/CalibrationGraph.module.scss";
import { CalibrationGraphContextProvider } from "./context/CalibrationGraphContext";
import PageName from "../../DEPRECATED_components/common/Page/PageName";
import { CalibrationGraphList } from "./components/CalibrationGraphList";
import { CalibrationGraphSearch } from "./components/CalibrationGraphElement/CalibrationGraphSearch";
import { SelectionContextProvider } from "../common/context/SelectionContext";

const CalibrationGraph = () => {
  const heading = "Run calibration graph";
  return (
    <div className={styles.wrapper}>
      <div className={styles.nodesContainer}>
        <div className={styles.titleWrapper}>
          <PageName>{heading}</PageName>
        </div>
        <CalibrationGraphSearch />
        <CalibrationGraphList />
      </div>
    </div>
  );
};

export default () => (
  <CalibrationGraphContextProvider>
    <SelectionContextProvider>
      <CalibrationGraph />
    </SelectionContextProvider>
  </CalibrationGraphContextProvider>
);
