import React from "react";
import { NodesContextProvider, useNodesContext } from "./context/NodesContext";
// eslint-disable-next-line css-modules/no-unused-class
import styles from "../Nodes/NodesPage.module.scss";
import { NodeElementList } from "./components/NodeElement/NodeElementList";
import PageName from "../../DEPRECATED_components/common/Page/PageName";
import { RunningJob } from "./components/RunningJob/RunningJob";
import { Results } from "./components/Results/Results";
import BlueButton from "../../ui-lib/components/Button/BlueButton";
import { SelectionContextProvider } from "../common/context/SelectionContext";

const NodesPage = () => {
  const heading = "Run calibration node";
  const { allNodes, fetchAllNodes } = useNodesContext();

  return (
    <div className={styles.wrapper}>
      <div className={styles.nodesContainer}>
        <div className={styles.titleWrapper}>
          <PageName>{heading}</PageName>
          <BlueButton onClick={() => fetchAllNodes()}>Refresh</BlueButton>
        </div>
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
    <SelectionContextProvider>
      <NodesPage />
    </SelectionContextProvider>
  </NodesContextProvider>
);
