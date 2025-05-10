import React, {useEffect, useState} from "react";
// eslint-disable-next-line css-modules/no-unused-class
import styles from "./RunningJob.module.scss";
import { useNodesContext } from "../../context/NodesContext";
import { StateUpdates } from "../StateUpdates/StateUpdates";
import { RunningJobInfoSection } from "./RunningJobInfoSection";
import { RunningJobParameters } from "./RunningJobParameters";
import { NodesApi } from "../../api/NodesAPI";

export const RunningJob: React.FC = () => {
  const {
    runningNodeInfo,
    setRunningNodeInfo,
    updateAllButtonPressed,
    setUpdateAllButtonPressed,
  } = useNodesContext();

  const [hasRun, setHasRun] = useState(false);

  useEffect(() => {
    const checkHasRun = async () => {
      const res = await NodesApi.fetchLastRunStatusInfo();
      if (res.isOk && res.result?.node?.status !== "pending") {
        setHasRun(true);
      }
    };

    checkHasRun();
  }, []);

  return (
    <div className={styles.wrapper} data-testid="running-job-wrapper">
      {hasRun && <RunningJobInfoSection />}
      <div className={styles.parameterStatesWrapper}>
        <div className={styles.parameterColumnWrapper}>
          <RunningJobParameters />
        </div>
        <div className={styles.statesColumnWrapper} data-testid="states-column-wrapper">
          <StateUpdates
            runningNodeInfo={runningNodeInfo}
            setRunningNodeInfo={setRunningNodeInfo}
            updateAllButtonPressed={updateAllButtonPressed}
            setUpdateAllButtonPressed={setUpdateAllButtonPressed}
          />
        </div>
      </div>
    </div>
  );
};
