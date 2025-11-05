import React from "react";
// eslint-disable-next-line css-modules/no-unused-class
import styles from "../Nodes/NodesPage.module.scss";
import { NodeElementList } from "./components/NodeElement/NodeElementList";
import { RunningJob } from "./components/RunningJob/RunningJob";
import { Results } from "./components/Results/Results";
import { CircularProgress } from "@mui/material";
import { useWebSocketData } from "../../contexts/WebSocketContext";
import { useSelector } from "react-redux";
import { useRootDispatch } from "../../stores";
import { getIsRescanningNodes, getResults } from "../../stores/NodesStore/selectors";

export const NodesPage = () => {
  const { runStatus } = useWebSocketData();
  const dispatch = useRootDispatch();
  const isRescanningNodes = useSelector(getIsRescanningNodes);
  const results = useSelector(getResults);

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
            {!isRescanningNodes && <NodeElementList />}
          </div>
        </div>
        <div className={styles.nodesContainerDown}>
          <div className={styles.nodeRunningJobInfoWrapper}>
            <RunningJob />
          </div>
          <Results
            jsonObject={results ?? {}}
            showSearch={false}
            toggleSwitch={true}
            errorObject={runStatus?.node?.run_results?.error}
          />
        </div>
      </div>
    </div>
  );
};

export default NodesPage;
