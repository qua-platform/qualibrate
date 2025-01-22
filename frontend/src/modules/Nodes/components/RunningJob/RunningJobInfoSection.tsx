import React from "react";
// eslint-disable-next-line css-modules/no-unused-class
import styles from "./RunningJob.module.scss";
import { useNodesContext } from "../../context/NodesContext";

export const RunningJobInfoSection: React.FC = () => {
  const { runningNodeInfo } = useNodesContext();

  return (
    <div className={styles.runInfoWrapper} data-testid="run-info-wrapper">
      <div className={styles.runInfoColumn} data-testid="run-info-column-1">
        {runningNodeInfo?.lastRunNodeName && (
          <div className={styles.runInfoRow} data-testid="run-info-row-last-node">
            <div className={styles.jobInfoKey} data-testid="run-info-key-last-node">Last run node:&nbsp;&nbsp;</div>
            <div className={styles.jobInfoValue} data-testid="run-info-value-last-node">{runningNodeInfo?.lastRunNodeName}</div>
          </div>
        )}
        {runningNodeInfo?.timestampOfRun && (
          <div className={styles.runInfoRow} data-testid="run-info-row-timestamp">
            <div className={styles.jobInfoKey} data-testid="run-info-key-timestamp">Run start:&nbsp;&nbsp;</div>
            <div className={styles.jobInfoValue} data-testid="run-info-value-timestamp">{runningNodeInfo?.timestampOfRun}</div>
          </div>
        )}
        {runningNodeInfo?.runDuration && (
          <div className={styles.runInfoRow} data-testid="run-info-row-duration">
            <div className={styles.jobInfoKey} data-testid="run-info-key-duration">Run duration:&nbsp;&nbsp;</div>
            <div className={styles.jobInfoValue} data-testid="run-info-value-duration">{runningNodeInfo?.runDuration}&nbsp;s</div>
          </div>
        )}
      </div>
      <div className={styles.runInfoColumn} data-testid="run-info-column-2">
        {runningNodeInfo?.status && (
          <div className={styles.runInfoRow} data-testid="run-info-row-status">
            <div className={styles.jobInfoKeySecondColumn} data-testid="run-info-key-status">Status:&nbsp;&nbsp;</div>
            <div className={styles.jobInfoValue} data-testid="run-info-value-status">{runningNodeInfo?.status}</div>
          </div>
        )}
        {runningNodeInfo?.idx && (
          <div className={styles.runInfoRow} data-testid="run-info-row-idx">
            <div className={styles.jobInfoKeySecondColumn} data-testid="run-info-key-idx">idx:&nbsp;&nbsp;</div>
            <div className={styles.jobInfoValue} data-testid="run-info-value-idx">{runningNodeInfo?.idx}</div>
          </div>
        )}
      </div>
    </div>
  );
};
