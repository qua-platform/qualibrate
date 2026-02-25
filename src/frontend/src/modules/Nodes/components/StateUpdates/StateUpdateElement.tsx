import React, { useState } from "react";
// eslint-disable-next-line css-modules/no-unused-class
import styles from "./StateUpdates.module.scss";
import { CircularProgress } from "@mui/material";
import { SnapshotsApi, getLatestSnapshotId, getSecondId, getTrackLatestSidePanel, fetchOneSnapshot } from "../../../../stores/SnapshotsStore";
import { ValueRow } from "./ValueRow";
import { useRootDispatch } from "../../../../stores";
import { setRunningNodeInfo, RunningNodeInfo, StateUpdateObject } from "../../../../stores/NodesStore";
import { useSelector } from "react-redux";
import { classNames } from "../../../../utils/classnames";

interface StateUpdateProps {
  stateKey: string;
  title: React.ReactNode;
  index: number;
  stateUpdateObject: StateUpdateObject;
  runningNodeInfo?: RunningNodeInfo;
  updateAllButtonPressed: boolean;
  onApprove: (isApproved: boolean) => void;
}

export const StateUpdateElement: React.FC<StateUpdateProps> = (props) => {
  const dispatch = useRootDispatch();
  const { stateKey, title, index, stateUpdateObject, runningNodeInfo, updateAllButtonPressed, onApprove } = props;
  const [runningUpdate, setRunningUpdate] = React.useState<boolean>(false);
  const [parameterUpdated, setParameterUpdated] = useState<boolean>(false);
  const [customValue, setCustomValue] = useState<string | number | null>(JSON.stringify(stateUpdateObject.val ?? stateUpdateObject.new ?? ""));
  const previousValue = JSON.stringify(stateUpdateObject.val ?? stateUpdateObject.new ?? "");
  const secondId = useSelector(getSecondId);
  const trackLatestSidePanel = useSelector(getTrackLatestSidePanel);
  const latestSnapshotId = useSelector(getLatestSnapshotId);

  const handleUpdateClick = async (isClearing?: boolean) => {
    if (runningNodeInfo && runningNodeInfo.idx && stateUpdateObject && ("val" in stateUpdateObject || "new" in stateUpdateObject)) {
      setRunningUpdate(true);

      const stateUpdateValue = isClearing
        ? stateUpdateObject.old
        : customValue
          ? customValue
          : (stateUpdateObject.val ?? stateUpdateObject.new!);
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
      onApprove(!isClearing);
      setRunningUpdate(false);
    }
  };

  if (parameterUpdated || updateAllButtonPressed)
    return;

  return (
    <div key={`${stateKey}-wrapper`} className={styles.stateUpdateWrapper} data-testid={`state-update-wrapper-${stateKey}`}>
      <div className={styles.stateUpdateOrderNumberAndTitleWrapper}>
        <div className={styles.stateUpdateOrderKey} data-testid={`state-update-key-${index}`}>
          {title}
        </div>
        <div className={styles.stateUpdateValueWrapper} data-testid={`state-update-value-wrapper-${index}`}>
          <ValueRow
            oldValue={JSON.stringify(stateUpdateObject.old)}
            previousValue={previousValue}
            customValue={customValue || ""}
            setCustomValue={setCustomValue}
            parameterUpdated={parameterUpdated || updateAllButtonPressed}
            setParameterUpdated={setParameterUpdated}
          />
        </div>
      </div>
      {!runningUpdate && !parameterUpdated && !updateAllButtonPressed && (
        <div className={styles.stateUpdateButtonContainer}>
          <button
            className={classNames(styles.stateUpdateButton, styles.approve)}
            data-testid="update-before-icon"
            onClick={() => handleUpdateClick()}
          >
            ✓
          </button>
          <button
            className={classNames(styles.stateUpdateButton, styles.reject)}
            data-testid="update-before-icon"
            onClick={() => handleUpdateClick(true)}
          >
            ✕
          </button>
        </div>
      )}
      {runningUpdate && !parameterUpdated && (
        <div className={styles.stateUpdateIconWrapper} data-testid="update-in-progress">
          <CircularProgress size={17} />
        </div>
      )}
    </div>
  );
};
