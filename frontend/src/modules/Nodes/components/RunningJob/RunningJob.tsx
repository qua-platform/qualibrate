import React from "react";
import styles from "./RunningJob.module.scss";
import { useNodesContext } from "../../context/NodesContext";

export const RunningJob: React.FC = () => {
  const { runningNode, runningNodeInfo } = useNodesContext();

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
    const [expanded] = React.useState<boolean>(true);
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
              {expanded &&
                Object.entries(runningNode?.input_parameters ?? {}).map(([key, parameter]) => (
                  <div key={key} className={styles.parameterValues}>
                    <div className={styles.parameterLabel}>{parameter.title}:</div>
                    <div className={styles.parameterValue}>{parameter.default?.toString()}</div>
                  </div>
                ))}
            </div>
          </div>
        )}
      </>
    );
  };

  // const stateUpdateComponent = (key: string, stateUpdateObject: StateUpdateObject) => {
  //   return (
  //     <div key={key} className={styles.stateUpdateComponentWrapper}>
  //       <BlueButton
  //         className={styles.stateUpdateButton}
  //         onClick={() => {
  //           if (runningNodeInfo && runningNodeInfo.idx && stateUpdateObject && stateUpdateObject.new) {
  //             SnapshotsApi.updateState(runningNodeInfo?.idx, key, stateUpdateObject.new.toString());
  //           }
  //         }}
  //       >
  //         Update
  //       </BlueButton>
  //       {stateUpdateObject?.label ? stateUpdateObject?.label.toString() : key.toString()}
  //       <div className={styles.stateUpdateAdditionalText}></div>
  //     </div>
  //   );
  // };

  // const getStateUpdates = () => {
  //   return (
  //     <>
  //       {runningNodeInfo?.stateUpdates && <div className={styles.stateTitle}>State updates:</div>}
  //       {Object.entries(runningNodeInfo?.stateUpdates ?? {}).map(([key, parameter]) => stateUpdateComponent(key, parameter))}
  //     </>
  //   );
  // };

  return (
    <div className={styles.wrapper}>
      <div className={styles.title}>
        <div className={styles.dot}></div>
        Running job {runningNode?.name ? ":" : ""}&nbsp;&nbsp;{runningNode?.name ?? ""}
      </div>
      <div className={styles.infoWrapper}>
        {getRunningJobInfo()}
        {getRunningJobParameters()}
      </div>
      {/*{getStateUpdates()}*/}
    </div>
  );
};
