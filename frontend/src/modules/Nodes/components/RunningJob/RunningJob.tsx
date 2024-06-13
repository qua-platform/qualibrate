import React from "react";
import styles from "./RunningJob.module.scss";
import { useNodesContext } from "../../context/NodesContext";

export const RunningJob: React.FC = () => {
  const { runningNode, runningNodeInfo } = useNodesContext();
  if (!runningNode) return null;

  return (
    <div className={styles.wrapper}>
      {runningNode?.name && (
        <div className={styles.title}>
          <div className={styles.dot}></div>
          Running job:&nbsp;&nbsp;{runningNode?.name}
        </div>
      )}
      <div className={styles.infoWrapper}>
        <div className={styles.runInfo}>
          {runningNodeInfo?.timestampOfRun && (
            <div className={styles.runInfoRow}>Run start:&nbsp;&nbsp;{runningNodeInfo?.timestampOfRun}</div>
          )}
          {runningNodeInfo?.runDuration && (
            <div className={styles.runInfoRow}>Run duration:&nbsp;&nbsp;{runningNodeInfo?.runDuration}&nbsp;seconds</div>
          )}
          {runningNodeInfo?.status && <div className={styles.runInfoRow}>Status:&nbsp;&nbsp;{runningNodeInfo?.status}</div>}
          {runningNodeInfo?.stateUpdates && (
            <div className={styles.runInfoRow}>State updates:&nbsp;&nbsp;{runningNodeInfo?.stateUpdates}</div>
          )}
        </div>
        {Object.entries(runningNode?.input_parameters ?? {}).length > 0 && (
          <div className={styles.parameterInfo}>
            <div>Parameters:</div>
            {Object.entries(runningNode?.input_parameters ?? {}).map(([key, parameter]) => (
              <div key={key} className={styles.parameterValuesWrapper}>
                <div className={styles.parameterLabel}>{parameter.title}:</div>
                <div className={styles.parameterValue}>{parameter.default?.toString()}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
