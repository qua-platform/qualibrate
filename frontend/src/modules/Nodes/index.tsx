import React from "react";
import { NodesContextProvider, useNodesContext } from "./context/NodesContext";
import styles from "../Nodes/NodesPage.module.scss";
import { NodeElementList } from "./components/NodeElement/NodeElementList";
import PageName from "../../DEPRECATED_components/common/Page/PageName";
import { RunningJob } from "./components/RunningJob/RunningJob";
import { Results } from "./components/Results/Results";

const NodesPage = () => {
  const heading = "Run calibration node";
  const { allNodes, runningNode, results } = useNodesContext();

  return (
    <div className={styles.wrapper}>
      <div className={styles.nodesContainer}>
        <PageName>{heading}</PageName>
        <NodeElementList listOfNodes={allNodes} />
      </div>
      <div className={styles.nodesContainer}>
        <RunningJob />
        <Results />
      </div>
    </div>
  );
};

export default () => (
  <NodesContextProvider>
    <NodesPage />
  </NodesContextProvider>
);
