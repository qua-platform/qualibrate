import React from "react";
import { NodesContextProvider, useNodesContext } from "./context/NodesContext";
// eslint-disable-next-line css-modules/no-unused-class
import styles from "../Nodes/NodesPage.module.scss";
import { NodeElementList } from "./components/NodeElement/NodeElementList";
import { RunningJob } from "./components/RunningJob/RunningJob";
import { Results } from "./components/Results/Results";
import { SelectionContextProvider } from "../common/context/SelectionContext";
import PageName from "../../common/ui-components/common/Page/PageName";

const NodesPage = () => {
  const heading = "Run calibration node";
  const { allNodes } = useNodesContext();

  return (
    <div className={styles.wrapper}>
      <div className={styles.titleWrapper}>
        <PageName>{heading}</PageName>
      </div>
      <div className={styles.nodesAndRunningJobInfoWrapper}>
        <div className={styles.nodesContainerTop}>
          <div className={styles.nodeElementListWrapper}>
            <NodeElementList listOfNodes={allNodes} />
          </div>
        </div>
        <div className={styles.nodesContainerDown}>
          <div className={styles.nodeRunningJobInfoWrapper}>
            <RunningJob />
          </div>
          <Results />
        </div>
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
