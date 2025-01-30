import React from "react";
import { NodesContextProvider, useNodesContext } from "./context/NodesContext";
// eslint-disable-next-line css-modules/no-unused-class
import styles from "../Nodes/NodesPage.module.scss";
import { NodeElementList } from "./components/NodeElement/NodeElementList";
import { RunningJob } from "./components/RunningJob/RunningJob";
import { Results } from "./components/Results/Results";
import { SelectionContextProvider } from "../common/context/SelectionContext";
import PageName from "../../common/ui-components/common/Page/PageName";
import BlueButton from "../../ui-lib/components/Button/BlueButton";

const NodesPage = () => {
  const heading = "Run calibration node";
  const { allNodes, fetchAllNodes } = useNodesContext();

  return (
    <div className={styles.wrapper} data-testid="nodes-page-wrapper">
      <div className={styles.titleWrapper} data-testid="title-wrapper">
        <PageName>{heading}</PageName>
        &nbsp;
        <BlueButton onClick={() => fetchAllNodes()} data-testid="refresh-button">Refresh</BlueButton>
      </div>
      <div className={styles.nodesAndRunningJobInfoWrapper} data-testid="nodes-and-job-wrapper">
        <div className={styles.nodesContainerTop}>
          <div className={styles.nodeElementListWrapper}>
            <NodeElementList listOfNodes={allNodes} />
          </div>
        </div>
        <div className={styles.nodesContainerDown}>
          <div className={styles.nodeRunningJobInfoWrapper}>
            <RunningJob />
          </div>
          <Results showSearch={false} />
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
