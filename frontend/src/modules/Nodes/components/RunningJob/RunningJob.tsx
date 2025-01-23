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
    <div className={styles.wrapper} data-testid="running-job-wrapper">
      <div className={styles.title} data-testid="running-job-title">
        <div className={styles.dot} data-testid="running-job-dot"></div>
        <div className={styles.runningJobWrapper} data-testid="running-job-name-wrapper">
          <div className={styles.runningJobNameWrapper} data-testid="running-job-name-container">
            <div data-testid="running-job-text">Running job{runningNode?.name ? ":" : ""}</div>
            <div className={styles.runningJobName} data-testid="running-job-name">&nbsp;&nbsp;{runningNode?.name ? insertSpaces(runningNode?.name) : ""}</div>
          </div>
        </div>
        {isNodeRunning && (
          <div className={styles.stopButtonWrapper} data-testid="stop-button-wrapper">
            <div onClick={handleStopClick} data-testid="stop-button">
              <StopIcon />
            </div>
          </div>
        )}
      </div>
      {runningNodeInfo && <RunningJobInfoSection data-testid="running-job-info-section" />}
      <div className={styles.parameterStatesWrapper} data-testid="parameter-states-wrapper">
        <div className={styles.parameterColumnWrapper} data-testid="parameter-column-wrapper">{runningNodeInfo && <RunningJobParameters />}</div>
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
