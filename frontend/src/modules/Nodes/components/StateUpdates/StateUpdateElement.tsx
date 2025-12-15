import React, { useState } from "react";
// eslint-disable-next-line css-modules/no-unused-class
import styles from "../RunningJob/RunningJob.module.scss";
import { CircularProgress } from "@mui/material";
import { SnapshotsApi, getLatestSnapshotId, getSecondId, getTrackLatestSidePanel, fetchOneSnapshot } from "../../../../stores/SnapshotsStore";
import { CheckMarkBeforeIcon, CheckMarkAfterIcon } from "../../../../components";
import { ValueRow } from "./ValueRow";
import { useRootDispatch } from "../../../../stores";
import { setRunningNodeInfo, RunningNodeInfo, StateUpdateObject } from "../../../../stores/NodesStore";
import { useSelector } from "react-redux";

interface StateUpdateProps {
  stateKey: string;
  index: number;
  stateUpdateObject: StateUpdateObject;
  runningNodeInfo?: RunningNodeInfo;
  updateAllButtonPressed: boolean;
}

export const StateUpdateElement: React.FC<StateUpdateProps> = (props) => {
  const dispatch = useRootDispatch();
  const { stateKey, index, stateUpdateObject, runningNodeInfo, updateAllButtonPressed } = props;
  const [runningUpdate, setRunningUpdate] = React.useState<boolean>(false);
  const [parameterUpdated, setParameterUpdated] = useState<boolean>(false);
  const [customValue, setCustomValue] = useState<string | number>(JSON.stringify(stateUpdateObject.val ?? stateUpdateObject.new ?? ""));
  const previousValue = JSON.stringify(stateUpdateObject.val ?? stateUpdateObject.new ?? "");
  const secondId = useSelector(getSecondId);
  const trackLatestSidePanel = useSelector(getTrackLatestSidePanel);
  const latestSnapshotId = useSelector(getLatestSnapshotId);

  const handleUpdateClick = async () => {
    if (runningNodeInfo && runningNodeInfo.idx && stateUpdateObject && ("val" in stateUpdateObject || "new" in stateUpdateObject)) {
      setRunningUpdate(true);
      const stateUpdateValue = customValue ? customValue : (stateUpdateObject.val ?? stateUpdateObject.new!);
      const response = await SnapshotsApi.updateState(runningNodeInfo?.idx, stateKey, stateUpdateValue);

      const stateUpdate = { ...stateUpdateObject, stateUpdated: response.result! };
      if (response.isOk && response.result && trackLatestSidePanel) {
        dispatch(fetchOneSnapshot(Number(latestSnapshotId), Number(secondId), false, true));
      }
      dispatch(setRunningNodeInfo({
        ...runningNodeInfo,
        state_updates: { ...runningNodeInfo.state_updates, [stateKey]: stateUpdate },
      }));
      setParameterUpdated(response.result!);
      setRunningUpdate(false);
    }
  };
  return (
    <div key={`${stateKey}-wrapper`} className={styles.stateUpdateWrapper} data-testid={`state-update-wrapper-${stateKey}`}>
      <div className={styles.stateUpdateOrderNumberAndTitleWrapper}>
        <div className={styles.stateUpdateOrderNumber}>{index + 1}</div>
        <div className={styles.stateUpdateOrderKey} data-testid={`state-update-key-${index}`}>
          {stateKey}
        </div>
      </div>
      <div className={styles.stateUpdateValueWrapper} data-testid={`state-update-value-wrapper-${index}`}>
        <ValueRow
          oldValue={JSON.stringify(stateUpdateObject.old)}
          previousValue={previousValue}
          customValue={customValue}
          setCustomValue={setCustomValue}
          parameterUpdated={parameterUpdated || updateAllButtonPressed}
          setParameterUpdated={setParameterUpdated}
        />
        {!runningUpdate && !parameterUpdated && !updateAllButtonPressed && (
          <div className={styles.stateUpdateIconBeforeWrapper} data-testid="update-before-icon" onClick={handleUpdateClick}>
            <CheckMarkBeforeIcon />
          </div>
        )}
        {runningUpdate && !parameterUpdated && (
          <div className={styles.stateUpdateIconAfterWrapper} data-testid="update-in-progress">
            <CircularProgress size={17} />
          </div>
        )}
        {(parameterUpdated || updateAllButtonPressed) && (
          <div className={styles.stateUpdateIconAfterWrapper} data-testid="update-after-icon">
            <CheckMarkAfterIcon />
          </div>
        )}
      </div>
    </div>
  );
};
