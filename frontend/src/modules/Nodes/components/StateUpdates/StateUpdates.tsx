import React from "react";
import { RunningNodeInfo, StateUpdate } from "../../context/NodesContext";
import { SnapshotsApi } from "../../../Snapshots/api/SnapshotsApi";
// eslint-disable-next-line css-modules/no-unused-class
import styles from "../RunningJob/RunningJob.module.scss";
import BlueButton from "../../../../ui-lib/components/Button/BlueButton";
import { StateUpdateComponent, StateUpdateProps } from "./StateUpdateComponent";

export const StateUpdates: React.FC<{
  runningNodeInfo: RunningNodeInfo | undefined;
  setRunningNodeInfo: (a: RunningNodeInfo) => void;
  updateAllButtonPressed: boolean;
  setUpdateAllButtonPressed: (a: boolean) => void;
}> = (props) => {
  const { runningNodeInfo, setRunningNodeInfo, updateAllButtonPressed, setUpdateAllButtonPressed } = props;

  const handleClick = async (stateUpdates: StateUpdate) => {
    const litOfUpdates = Object.entries(stateUpdates ?? {})
      .filter(([, stateUpdateObject]) => !stateUpdateObject.stateUpdated)
      .map(([key, stateUpdateObject]) => {
        return {
          data_path: key,
          value: stateUpdateObject.val ?? stateUpdateObject.new!,
        };
      });
    const result = await SnapshotsApi.updateStates(runningNodeInfo?.idx ?? "", litOfUpdates);
    if (result.isOk) {
      setUpdateAllButtonPressed(result.result!);
    }
  };

  return (
    <>
      {Object.entries(runningNodeInfo?.state_updates ?? {}).filter(([, stateUpdateObject]) => !stateUpdateObject.stateUpdated).length >
        0 && (
        <div className={styles.stateTitle}>
          State updates:
          <div className={styles.updateAll}>
            <BlueButton
              className={styles.updateAllButton}
              disabled={updateAllButtonPressed}
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
              setRunningNodeInfo,
              updateAllButtonPressed,
            } as StateUpdateProps)
          )}
        </div>
      )}
    </>
  );
};
