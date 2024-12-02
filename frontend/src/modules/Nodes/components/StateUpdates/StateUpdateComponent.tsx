import React, { useState } from "react";
// eslint-disable-next-line css-modules/no-unused-class
import styles from "../RunningJob/RunningJob.module.scss";
import { SnapshotsApi } from "../../../Snapshots/api/SnapshotsApi";
import { UpArrowIcon } from "../../../../ui-lib/Icons/UpArrowIcon";
import { CircularProgress } from "@mui/material";
import { CheckMarkIcon } from "../../../../ui-lib/Icons/CheckMarkIcon";
import { RightArrowIcon } from "../../../../ui-lib/Icons/RightArrowIcon";
import { EditIcon } from "../../../../ui-lib/Icons/EditIcon";
import { RunningNodeInfo, StateUpdateObject } from "../../context/NodesContext";
import InputField from "../../../../common/ui-components/common/Input/InputField";

export interface StateUpdateProps {
  key: string;
  stateUpdateObject: StateUpdateObject;
  runningNodeInfo?: RunningNodeInfo;
}

export const StateUpdateComponent: React.FC<StateUpdateProps> = (props) => {
  const { key, stateUpdateObject, runningNodeInfo } = props;
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
                  onChange={(val) => {
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
