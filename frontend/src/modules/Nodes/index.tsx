import React, { useEffect } from "react";
import { NodesContextProvider, useNodesContext } from "./context/NodesContext";
// eslint-disable-next-line css-modules/no-unused-class
import styles from "../Nodes/NodesPage.module.scss";
import { NodeElementList } from "./components/NodeElement/NodeElementList";
import { RunningJob } from "./components/RunningJob/RunningJob";
import { Results } from "./components/Results/Results";
import { SelectionContextProvider } from "../common/context/SelectionContext";
import BlueButton from "../../ui-lib/components/Button/BlueButton";
import { useFlexLayoutContext } from "../../routing/flexLayout/FlexLayoutContext";
import { CircularProgress } from "@mui/material";

export const NodesPage = () => {
  const { allNodes, runningNodeInfo, fetchAllNodes, isRescanningNodes } = useNodesContext();
  const { topBarAdditionalComponents, setTopBarAdditionalComponents } = useFlexLayoutContext();
  const NodeTopBarRefreshButton = () => {
    return (
      <div className={styles.refreshButtonWrapper} data-testid="refresh-button">
        <BlueButton onClick={() => fetchAllNodes()}>Refresh</BlueButton>
      </div>
    );
  };
  useEffect(() => {
    setTopBarAdditionalComponents({ ...topBarAdditionalComponents, nodes: <NodeTopBarRefreshButton /> });
  }, []);

  return (
    <div className={styles.wrapper} data-testid="nodes-page-wrapper">
      <div className={styles.nodesAndRunningJobInfoWrapper} data-testid="nodes-and-job-wrapper">
        <div className={styles.nodesContainerTop}>
          <div className={styles.nodeElementListWrapper}>
            {isRescanningNodes && (
              <div className={styles.loadingContainer}>
                <CircularProgress size={32} />
                Node library scan in progress
                <div>
                  See <span className={styles.logsText}>LOGS</span> for details (bottomright){" "}
                </div>
              </div>
            )}
            <NodeElementList listOfNodes={allNodes} />
          </div>
        </div>
        <div className={styles.nodesContainerDown}>
          <div className={styles.nodeRunningJobInfoWrapper}>
            <RunningJob />
          </div>
          <Results showSearch={false} toggleSwitch={true} pageName={"nodes"} errorObject={runningNodeInfo?.error} />
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
