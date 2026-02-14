import React from "react";
// eslint-disable-next-line css-modules/no-unused-class
import styles from "./NodesRightPanel.module.scss";
import { RunningJob } from "../RunningJob/RunningJob";
import { Results } from "../../../../components";
import { useSelector } from "react-redux";
import { getResults } from "../../../../stores/NodesStore";
import { getRunResultNodeError } from "../../../../stores/WebSocketStore";

export const NodesRightPanel = () => {
  const results = useSelector(getResults);
  const runResultError = useSelector(getRunResultNodeError);

  return (
    <div className={styles.wrapper} data-testid="nodes-page-wrapper">
      <div className={styles.nodesAndRunningJobInfoWrapper} data-testid="nodes-and-job-wrapper">
        <div className={styles.nodesContainerDown}>
          <div className={styles.nodeRunningJobInfoWrapper}>
            <RunningJob />
          </div>
          <Results jsonObject={results ?? {}} showSearch={false} toggleSwitch={true} errorObject={runResultError} />
        </div>
      </div>
    </div>
  );
};
