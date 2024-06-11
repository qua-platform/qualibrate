import React from "react";
import { NodesContextProvider, useNodesContext } from "./context/NodesContext";
import styles from "../Nodes/NodesPage.module.scss";
import { NodeElementList } from "./components/NodeElementList";
import PageName from "../../DEPRECATED_components/common/Page/PageName";

const NodesPage = () => {
  const heading = "Run calibration node";
  const { allNodes } = useNodesContext();
  return (
    <div className={styles.wrapper}>
      <div className={styles.nodesContainer}>
        <PageName>{heading}</PageName>
        <div className={styles.listWrapper}>
          <NodeElementList listOfNodes={allNodes} />
        </div>
      </div>
      <div className={styles.nodesContainer}>
        <div className={styles.runningJob}>
          <div className={styles.dot}></div>
          Running job
        </div>

        <div className={styles.results}>Results</div>
      </div>
    </div>
  );
};

export default () => (
  <NodesContextProvider>
    <NodesPage />
  </NodesContextProvider>
);
