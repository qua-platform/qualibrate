import React, { useState } from "react";
import styles from "./RunningJob.module.scss";
import { RunningNodeInfo, StateUpdate, StateUpdateObject, useNodesContext } from "../../context/NodesContext";
import { CircularProgress } from "@mui/material";
import { UpArrowIcon } from "../../../../ui-lib/Icons/UpArrowIcon";
import { SnapshotsApi } from "../../../Snapshots/api/SnapshotsApi";
import { CheckMarkIcon } from "../../../../ui-lib/Icons/CheckMarkIcon";
import { RightArrowIcon } from "../../../../ui-lib/Icons/RightArrowIcon";
import BlueButton from "../../../../ui-lib/components/Button/BlueButton";
import { EditIcon } from "../../../../ui-lib/Icons/EditIcon";
import { ErrorStatusWrapper } from "../../../common/Error/ErrorStatusWrapper";
import InputField from "../../../../common/ui-components/common/Input/InputField";

interface StateUpdateComponentProps {
  key: string;
  stateUpdateObject: StateUpdateObject;
  runningNodeInfo?: RunningNodeInfo;
  isAllStatusesUpdated: boolean;
}

const StateUpdateComponent: React.FC<StateUpdateComponentProps> = (props) => {
  const { key, stateUpdateObject, runningNodeInfo, isAllStatusesUpdated } = props;
  const [runningUpdate, setRunningUpdate] = React.useState<boolean>(false);
  const [parameterUpdated, setParameterUpdated] = useState<boolean>(false);
  const [editMode, setEditMode] = useState<boolean>(false);
  const [customValue, setCustomValue] = useState<unknown>(undefined);

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
                const stateUpdateValue = customValue ? customValue : stateUpdateObject.val ?? stateUpdateObject.new!;
                const response = await SnapshotsApi.updateState(runningNodeInfo?.idx, key, stateUpdateValue);
                setRunningUpdate(false);
                setParameterUpdated(response.result!);
                setRunningUpdate(false);
              }
            }}
          >
            {!isAllStatusesUpdated && <UpArrowIcon />}
            {isAllStatusesUpdated && <CheckMarkIcon />}
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
            <div className={styles.stateUpdateValueTextWrapper}>
              {JSON.stringify(stateUpdateObject.old)}&nbsp;&nbsp;
              <RightArrowIcon />
              &nbsp;&nbsp;{JSON.stringify(stateUpdateObject.val ?? stateUpdateObject.new ?? "")}
              <div
                className={styles.editIconWrapper}
                onClick={() => {
                  setEditMode(true);
                  setCustomValue(JSON.stringify(stateUpdateObject.val ?? stateUpdateObject.new));
                }}
              >
                {!editMode && <EditIcon />}
              </div>
              {editMode && (
                <InputField
                  className={styles.newValueOfState}
                  value={customValue as string | number | readonly string[] | undefined}
                  onChange={(val: unknown) => {
                    setCustomValue(val);
                  }}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const GetStateUpdates: React.FC<{
  runningNodeInfo: RunningNodeInfo | undefined;
  isAllStatusesUpdated: boolean;
  setIsAllStatusesUpdated: (a: boolean) => void;
}> = (props) => {
  const { runningNodeInfo, isAllStatusesUpdated, setIsAllStatusesUpdated } = props;

  const handleClick = async (stateUpdates: StateUpdate) => {
    const litOfUpdates = Object.entries(stateUpdates ?? {}).map(([key, stateUpdateObject]) => {
      return {
        data_path: key,
        value: stateUpdateObject.val ?? stateUpdateObject.new!,
      };
    });
    const retVal = await SnapshotsApi.updateStates(runningNodeInfo?.idx ?? "", litOfUpdates);
    if (retVal && retVal.isOk) {
      setIsAllStatusesUpdated(retVal.result!);
    }
  };

  return (
    <>
      {runningNodeInfo?.state_updates && Object.keys(runningNodeInfo?.state_updates).length > 0 && (
        <div className={styles.stateTitle}>
          State updates:
          <div className={styles.updateAll}>
            <BlueButton
              className={styles.updateAllButton}
              disabled={false}
              onClick={() => handleClick(runningNodeInfo?.state_updates ?? {})}
            >
              Update all
            </BlueButton>
          </div>
        </div>
      )}
      {runningNodeInfo?.state_updates && (
        <div className={styles.stateUpdatesTopWrapper}>
          {Object.entries(runningNodeInfo?.state_updates ?? {}).map(([key, stateUpdateObject]) =>
            StateUpdateComponent({
              key,
              stateUpdateObject,
              runningNodeInfo,
              isAllStatusesUpdated,
            } as StateUpdateComponentProps)
          )}
        </div>
      )}
    </>
  );
};

export const RunningJob: React.FC = () => {
  const { runningNode, runningNodeInfo, isNodeRunning, setIsNodeRunning, isAllStatusesUpdated, setIsAllStatusesUpdated } =
    useNodesContext();

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
        <div>
          Running job {runningNode?.name ? ":" : ""}&nbsp;&nbsp;{runningNode?.name ? insertSpaces(runningNode?.name) : ""}
        </div>
        {isNodeRunning && (
          <div className={styles.stopButtonWrapper}>
            <BlueButton className={styles.stopButton} onClick={handleStopClick}>
              Stop
            </BlueButton>
          </div>
        )}
      </div>
      {runningNodeInfo && (
        <div className={styles.infoWrapper}>
          {getRunningJobInfo()}
          {getRunningJobParameters()}
        </div>
      )}
      <GetStateUpdates
        runningNodeInfo={runningNodeInfo}
        isAllStatusesUpdated={isAllStatusesUpdated}
        setIsAllStatusesUpdated={setIsAllStatusesUpdated}
      />
      <ErrorStatusWrapper error={runningNodeInfo?.error} />
    </div>
  );
};
