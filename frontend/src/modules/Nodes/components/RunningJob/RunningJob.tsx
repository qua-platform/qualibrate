import React from "react";
// eslint-disable-next-line css-modules/no-unused-class
import styles from "./RunningJob.module.scss";
import { useNodesContext } from "../../context/NodesContext";
import { SnapshotsApi } from "../../../Snapshots/api/SnapshotsApi";
import { ErrorStatusWrapper } from "../../../common/Error/ErrorStatusWrapper";
import { StateUpdates } from "../StateUpdates/StateUpdates";
import { StopIcon } from "../../../../ui-lib/Icons/StopIcon";

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

  const getRunningJobInfo = () => {
    return (
      <div className={styles.runInfoWrapper}>
        <div className={styles.runInfoColumn}>
          {runningNodeInfo?.lastRunNodeName && (
            <div className={styles.runInfoRow}>
              <div className={styles.jobInfoKey}>Last run node:&nbsp;&nbsp;</div>
              <div className={styles.jobInfoValue}>{runningNodeInfo?.lastRunNodeName}</div>
            </div>
          )}
          {runningNodeInfo?.timestampOfRun && (
            <div className={styles.runInfoRow}>
              <div className={styles.jobInfoKey}>Run start:&nbsp;&nbsp;</div>
              <div className={styles.jobInfoValue}>{runningNodeInfo?.timestampOfRun}</div>
            </div>
          )}
          {runningNodeInfo?.runDuration && (
            <div className={styles.runInfoRow}>
              <div className={styles.jobInfoKey}>Run duration:&nbsp;&nbsp;</div>
              <div className={styles.jobInfoValue}>{runningNodeInfo?.runDuration}&nbsp;s</div>
            </div>
          )}
        </div>
        <div className={styles.runInfoColumn}>
          {runningNodeInfo?.status && (
            <div className={styles.runInfoRow}>
              <div className={styles.jobInfoKeySecondColumn}>Status:&nbsp;&nbsp;</div>
              <div className={styles.jobInfoValue}>{runningNodeInfo?.status}</div>
            </div>
          )}
          {runningNodeInfo?.idx && (
            <div className={styles.runInfoRow}>
              <div className={styles.jobInfoKeySecondColumn}>idx:&nbsp;&nbsp;</div>
              <div className={styles.jobInfoValue}>{runningNodeInfo?.idx}</div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const getRunningJobParameters = () => {
    return (
      <>
        {Object.entries(runningNode?.parameters ?? {}).length > 0 && (
          <div className={styles.parameterInfo}>
            <div className={styles.parameterTitleWrapper}>
              {/*<div className={styles.arrowIconWrapper} onClick={() => setExpanded(!expanded)}>*/}
              {/*  <ArrowIcon options={{ rotationDegree: expanded ? 0 : -90 }} />*/}
              {/*</div>*/}
              Parameters:
            </div>
            <div>
              {
                // expanded &&
                Object.entries(runningNode?.parameters ?? {}).map(([key, parameter]) => (
                  <div key={key} className={styles.parameterValues}>
                    <div className={styles.parameterLabel}>{parameter.title}:</div>
                    <div className={styles.parameterValue}>{parameter.default?.toString()}</div>
                  </div>
                ))
              }
            </div>
          </div>
        )}
      </>
    );
  };
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
      {runningNodeInfo && (
        <div className={styles.infoWrapper}>
          {getRunningJobInfo()}
          {getRunningJobParameters()}
        </div>
      )}
      <StateUpdates
        runningNodeInfo={runningNodeInfo}
        setRunningNodeInfo={setRunningNodeInfo}
        updateAllButtonPressed={updateAllButtonPressed}
        setUpdateAllButtonPressed={setUpdateAllButtonPressed}
      />
      <ErrorStatusWrapper error={runningNodeInfo?.error} />
    </div>
  );
};
