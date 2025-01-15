import React from "react";
// eslint-disable-next-line css-modules/no-unused-class
import styles from "./RunningJob.module.scss";
import { useNodesContext } from "../../context/NodesContext";

export const RunningJobInfoSection: React.FC = () => {
  const { runningNodeInfo } = useNodesContext();

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
