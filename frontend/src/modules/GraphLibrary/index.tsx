import React from "react";
// eslint-disable-next-line css-modules/no-unused-class
import styles from "./GraphLibrary.module.scss";
import { GraphContextProvider } from "./context/GraphContext";
import PageName from "../../DEPRECATED_components/common/Page/PageName";
import { GraphList } from "./components/GraphList";
import { GraphSearch } from "./components/GraphElement/GraphSearch";
import { SelectionContextProvider } from "../common/context/SelectionContext";

const GraphLibrary = () => {
  const heading = "Run calibration graph";
  return (
    <div className={styles.wrapper}>
      <div className={styles.nodesContainer}>
        <div className={styles.titleWrapper}>
          <PageName>{heading}</PageName>
        </div>
        <GraphSearch />
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
