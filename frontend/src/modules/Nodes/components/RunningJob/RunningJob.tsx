import React, { useState } from "react";
import styles from "./RunningJob.module.scss";
import { RunningNodeInfo, StateUpdateObject, useNodesContext } from "../../context/NodesContext";
import { CircularProgress } from "@mui/material";
import { UpArrowIcon } from "../../../../ui-lib/Icons/UpArrowIcon";
import { SnapshotsApi } from "../../../Snapshots/api/SnapshotsApi";
import { CheckMarkIcon } from "../../../../ui-lib/Icons/CheckMarkIcon";
import { RightArrowIcon } from "../../../../ui-lib/Icons/RightArrowIcon";

interface StateUpdateComponentProps {
  key: string;
  stateUpdateObject: StateUpdateObject;
  runningNodeInfo?: RunningNodeInfo;
}

const StateUpdateComponent: React.FC<StateUpdateComponentProps> = (props) => {
  const { key, stateUpdateObject, runningNodeInfo } = props;
  const [runningUpdate, setRunningUpdate] = React.useState<boolean>(false);
  const [parameterUpdated, setParameterUpdated] = useState<boolean>(false);

  const renderSuggestedValue = (value: string | number | number[]) => {
    if (Array.isArray(value)) {
      return "[" + value.toString() + "]";
    }
    return value.toString();
  };
  console.log(stateUpdateObject);
  return (
    <div key={`${key}-wrapper`} className={styles.stateUpdateWrapper}>
      <div>
        {!runningUpdate && !parameterUpdated && (
          <div
            onClick={async () => {
              if (
                runningNodeInfo &&
                runningNodeInfo.idx &&
                stateUpdateObject &&
                ("val" in stateUpdateObject || "new" in stateUpdateObject)
              ) {
                setRunningUpdate(true);
                const response = await SnapshotsApi.updateState(
                  runningNodeInfo?.idx,
                  key,
                  (stateUpdateObject.val ? stateUpdateObject.val : stateUpdateObject.new!).toString()
                );
                setRunningUpdate(false);
                if (response.isOk) {
                  setParameterUpdated(response.result!);
                } else {
                  setParameterUpdated(response.result!); //TODO Check this
                }
              }
            }}
          >
            <UpArrowIcon />
          </div>
        )}
        <div className={styles.stateUpdateIconWrapper}>
          {runningUpdate && !parameterUpdated && <CircularProgress size={32} />}
          {!runningUpdate && parameterUpdated && <CheckMarkIcon />}
        </div>
      </div>
      <div key={key} className={styles.stateUpdateComponentTextWrapper}>
        <div className={styles.stateUpdateKeyText}>{stateUpdateObject?.key ? stateUpdateObject?.key.toString() : key.toString()}</div>
        <div className={styles.stateUpdateValueText}>
          {stateUpdateObject && (
            <div>
              {stateUpdateObject.old}&nbsp;&nbsp;
              <RightArrowIcon />
              &nbsp;&nbsp;{renderSuggestedValue(stateUpdateObject.val ?? stateUpdateObject.new ?? "")}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const GetStateUpdates: React.FC<{
  runningNodeInfo: RunningNodeInfo | undefined;
}> = (props) => {
  const { runningNodeInfo } = props;
  return (
    <>
      {runningNodeInfo?.state_updates && <div className={styles.stateTitle}>State updates:</div>}
      {runningNodeInfo?.state_updates && (
        <div className={styles.stateUpdatesTopWrapper}>
          {Object.entries(runningNodeInfo?.state_updates ?? {}).map(([key, stateUpdateObject]) =>
            StateUpdateComponent({
              key,
              stateUpdateObject,
              runningNodeInfo,
            } as StateUpdateComponentProps)
          )}
        </div>
      )}
    </>
  );
};

const NodeStatusErrorWrapper: React.FC<{
  runningNodeInfo: RunningNodeInfo | undefined;
}> = (props) => {
  const { runningNodeInfo } = props;
  return (
    <>
      {runningNodeInfo?.error && <div className={styles.stateTitle}>Error traceback:</div>}
      <div className={styles.nodeStatusErrorWrapper}>
        {(runningNodeInfo?.error?.traceback ?? []).map((row, index) => (
          <div key={`${row}-${index}`} className={styles.nodeStatusErrorWrapper}>
            {row}
          </div>
        ))}
      </div>
    </>
  );
};

export const RunningJob: React.FC = () => {
  const { runningNode, runningNodeInfo } = useNodesContext();

  const getRunningJobInfo = () => {
    return (
      <div className={styles.runInfo}>
        {runningNodeInfo?.lastRunNodeName && (
          <div className={styles.runInfoRow}>Last run node:&nbsp;&nbsp;{runningNodeInfo?.lastRunNodeName}</div>
        )}
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
      <GetStateUpdates runningNodeInfo={runningNodeInfo} />
      <NodeStatusErrorWrapper runningNodeInfo={runningNodeInfo} />
    </div>
  );
};
