import React from "react";
// eslint-disable-next-line css-modules/no-unused-class
import styles from "./RunningJob.module.scss";
import { useNodesContext } from "../../context/NodesContext";
import { SnapshotsApi } from "../../../Snapshots/api/SnapshotsApi";
import { StateUpdates } from "../StateUpdates/StateUpdates";
import { StopIcon } from "../../../../ui-lib/Icons/StopIcon";
import { RunningJobInfoSection } from "./RunningJobInfoSection";
import { RunningJobParameters } from "./RunningJobParameters";

export const RunningJob: React.FC = () => {
  const {
    runningNode,
    runningNodeInfo,
    setRunningNodeInfo,
    isNodeRunning,
    setIsNodeRunning,
    updateAllButtonPressed,
    setUpdateAllButtonPressed,
  } = useNodesContext();

  const insertSpaces = (str: string, interval = 40) => {
    let result = "";
    for (let i = 0; i < str.length; i += interval) {
      result += str.slice(i, i + interval) + " ";
    }
    return result.trim();
  };

  const handleStopClick = () => {
    SnapshotsApi.stopNodeRunning().then((res) => {
      if (res.isOk) {
        setIsNodeRunning(!res.result);
      }
    });
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.title}>
        <div className={styles.dot}></div>
        <div className={styles.runningJobWrapper}>
          <div className={styles.runningJobNameWrapper}>
            <div>Running job{runningNode?.name ? ":" : ""}</div>
            <div className={styles.runningJobName}>&nbsp;&nbsp;{runningNode?.name ? insertSpaces(runningNode?.name) : ""}</div>
          </div>
        </div>
        {isNodeRunning && (
          <div className={styles.stopButtonWrapper}>
            <div onClick={handleStopClick}>
              <StopIcon />
            </div>
          </div>
        )}
      </div>
      {runningNodeInfo && <RunningJobInfoSection />}
      <div className={styles.parameterStatesWrapper}>
        <div className={styles.parameterColumnWrapper}>{runningNodeInfo && <RunningJobParameters />}</div>
        <div className={styles.statesColumnWrapper}>
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
