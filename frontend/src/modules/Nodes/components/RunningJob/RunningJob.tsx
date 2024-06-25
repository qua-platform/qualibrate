import React from "react";
import styles from "./RunningJob.module.scss";
import { StateUpdateObject, useNodesContext } from "../../context/NodesContext";
import BlueButton from "../../../../ui-lib/components/Button/BlueButton";
import { SnapshotsApi } from "../../../Snapshots/api/SnapshotsApi";
import { CircularProgress } from "@mui/material";

export const RunningJob: React.FC = () => {
  const { runningNode, runningNodeInfo } = useNodesContext();
  const [runningUpdate, setRunningUpdate] = React.useState<boolean>(false);

  const getRunningJobInfo = () => {
    return (
      <div className={styles.runInfo}>
        {runningNodeInfo?.timestampOfRun && (
          <div className={styles.runInfoRow}>Run start:&nbsp;&nbsp;{runningNodeInfo?.timestampOfRun}</div>
        )}
        {runningNodeInfo?.runDuration && (
          <div className={styles.runInfoRow}>Run duration:&nbsp;&nbsp;{runningNodeInfo?.runDuration}&nbsp;seconds</div>
        )}
        {runningNodeInfo?.status && <div className={styles.runInfoRow}>Status:&nbsp;&nbsp;{runningNodeInfo?.status}</div>}
        {runningNodeInfo?.idx && <div className={styles.runInfoRow}>idx:&nbsp;&nbsp;{runningNodeInfo?.idx}</div>}
      </div>
    );
  };

  const getRunningJobParameters = () => {
    return (
      <>
        {Object.entries(runningNode?.input_parameters ?? {}).length > 0 && (
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
                Object.entries(runningNode?.input_parameters ?? {}).map(([key, parameter]) => (
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

  const stateUpdateComponent = (key: string, stateUpdateObject: StateUpdateObject) => {
    return (
      <div className={styles.stateUpdateWrapper}>
        <div key={key} className={styles.stateUpdateComponentWrapper}>
          {!runningUpdate && (
            <BlueButton
              className={styles.stateUpdateButton}
              onClick={async () => {
                if (runningNodeInfo && runningNodeInfo.idx && stateUpdateObject && stateUpdateObject.val) {
                  setRunningUpdate(true);
                  await SnapshotsApi.updateState(runningNodeInfo?.idx, key, stateUpdateObject.val.toString()).then(() => {
                    setRunningUpdate(false);
                  });
                }
              }}
            >
              Update
            </BlueButton>
          )}
          {runningUpdate && <CircularProgress />}
          <div className={styles.stateUpdateRowWrapper}>{stateUpdateObject?.key ? stateUpdateObject?.key.toString() : key.toString()}</div>
        </div>
        <div key={key} className={styles.stateUpdateComponentAdditionalWrapper}>
          {stateUpdateObject && <div>{`${stateUpdateObject.old} -> ${stateUpdateObject.val}`}</div>}
        </div>
      </div>
    );
  };

  const getStateUpdates = () => {
    return (
      <>
        {runningNodeInfo?.state_updates && <div className={styles.stateTitle}>State updates:</div>}
        {Object.entries(runningNodeInfo?.state_updates ?? {}).map(([key, parameter]) => stateUpdateComponent(key, parameter))}
      </>
    );
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.title}>
        <div className={styles.dot}></div>
        Running job {runningNode?.name ? ":" : ""}&nbsp;&nbsp;{runningNode?.name ?? ""}
      </div>
      {runningNodeInfo && (
        <div className={styles.infoWrapper}>
          {getRunningJobInfo()}
          {getRunningJobParameters()}
        </div>
      )}
      {getStateUpdates()}
    </div>
  );
};
