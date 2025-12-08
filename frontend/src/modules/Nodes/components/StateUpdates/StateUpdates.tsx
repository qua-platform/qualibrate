import React from "react";
import { SnapshotsApi, getLatestSnapshotId, getSecondId, getTrackLatestSidePanel, fetchOneSnapshot } from "../../../../stores/SnapshotsStore";
// eslint-disable-next-line css-modules/no-unused-class
import styles from "../RunningJob/RunningJob.module.scss";
import { StateUpdateElement } from "./StateUpdateElement";
import { Button } from "@mui/material";
// import { ErrorStatusWrapper } from "../../../common/Error/ErrorStatusWrapper";
import { getRunningNodeInfo, getUpdateAllButtonPressed, setUpdateAllButtonPressed, StateUpdate } from "../../../../stores/NodesStore";
import { useSelector } from "react-redux";
import { useRootDispatch } from "../../../../stores";

export const StateUpdates: React.FC = () => {
  const dispatch = useRootDispatch();
  const trackLatestSidePanel = useSelector(getTrackLatestSidePanel);
  const latestSnapshotId = useSelector(getLatestSnapshotId);
  const secondId = useSelector(getSecondId);
  const runningNodeInfo = useSelector(getRunningNodeInfo);
  const updateAllButtonPressed = useSelector(getUpdateAllButtonPressed);

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
      dispatch(setUpdateAllButtonPressed(result.result!));
      if (result.result && trackLatestSidePanel) {
        dispatch(fetchOneSnapshot(Number(latestSnapshotId), Number(secondId), false, true));
      }
    }
  };

  return (
    <>
      {/*{Object.entries(runningNodeInfo?.state_updates ?? {}).filter(([, stateUpdateObject]) => !stateUpdateObject.stateUpdated).length >*/}
      {/*  0 && (*/}
      <div className={styles.stateWrapper} data-testid="state-wrapper">
        <div className={styles.stateTitle} data-testid="state-title">
          State updates&nbsp;
          {runningNodeInfo?.state_updates && Object.keys(runningNodeInfo?.state_updates).length > 0
            ? `(${Object.keys(runningNodeInfo?.state_updates).length})`
            : ""}
        </div>
        {updateAllButtonPressed ||
          (Object.entries(runningNodeInfo?.state_updates ?? {}).filter(([, stateUpdateObject]) => !stateUpdateObject.stateUpdated).length >
            0 && (
            <Button
              className={styles.updateAllButton}
              data-testid="update-all-button"
              disabled={updateAllButtonPressed}
              onClick={() => handleClick(runningNodeInfo?.state_updates ?? {})}
            >
              Accept All
            </Button>
          ))}
      </div>
      {/*// )}*/}
      {runningNodeInfo?.state_updates && (
        <div className={styles.stateUpdatesTopWrapper} data-testid="state-updates-top-wrapper">
          {Object.entries(runningNodeInfo?.state_updates ?? {}).map(([key, stateUpdateObject], index) => (
            <StateUpdateElement
              key={key}
              stateKey={key}
              index={index}
              stateUpdateObject={stateUpdateObject}
              runningNodeInfo={runningNodeInfo}
              updateAllButtonPressed={updateAllButtonPressed}
            />
          ))}

          {/*{runningNodeInfo?.error && <ErrorStatusWrapper error={runningNodeInfo?.error} />}*/}
        </div>
      )}
    </>
  );
};
