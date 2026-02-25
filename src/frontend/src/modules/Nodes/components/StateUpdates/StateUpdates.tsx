import React, { useCallback, useMemo, useState } from "react";
import {
  SnapshotsApi,
  getLatestSnapshotId,
  getSecondId,
  getTrackLatestSidePanel,
  fetchOneSnapshot,
} from "../../../../stores/SnapshotsStore";
// eslint-disable-next-line css-modules/no-unused-class
import styles from "./StateUpdates.module.scss";
import { StateUpdateElement } from "./StateUpdateElement";
import { Button } from "@mui/material";
import { getRunningNodeInfo, getUpdateAllButtonPressed, setUpdateAllButtonPressed } from "../../../../stores/NodesStore";
import { useSelector } from "react-redux";
import { useRootDispatch } from "../../../../stores";
import { getHighlightedText, getSearchStringIndex } from "../../../../utils/getHighlightedText";
import { classNames } from "../../../../utils/classnames";
import { InputField } from "../../../../components";

export const StateUpdates: React.FC = () => {
  const [searchValue, setSearch] = useState<string>("");
  const [approved, setApproved] = useState(0);
  const dispatch = useRootDispatch();
  const trackLatestSidePanel = useSelector(getTrackLatestSidePanel);
  const latestSnapshotId = useSelector(getLatestSnapshotId);
  const secondId = useSelector(getSecondId);
  const runningNodeInfo = useSelector(getRunningNodeInfo);
  const updateAllButtonPressed = useSelector(getUpdateAllButtonPressed);

  const pendingCount = useMemo(
    () =>
      updateAllButtonPressed ||
      Object.entries(runningNodeInfo?.state_updates ?? {}).filter(([, stateUpdateObject]) => !stateUpdateObject.stateUpdated).length,
    [updateAllButtonPressed, runningNodeInfo?.state_updates]
  );
  const filteredOptions = useMemo(
    () =>
      Object.entries(runningNodeInfo?.state_updates ?? {}).filter(
        ([key, stateUpdateObject]) => !stateUpdateObject.stateUpdated && getSearchStringIndex(key, searchValue) !== -1
      ),
    [runningNodeInfo?.state_updates, searchValue]
  );

  const handleClick = useCallback(
    async (isApprooving: boolean) => {
      const stateUpdates = filteredOptions ?? [];
      const litOfUpdates = stateUpdates
        .filter(([, stateUpdateObject]) => !stateUpdateObject.stateUpdated)
        .map(([key, stateUpdateObject]) => {
          return {
            data_path: key,
            value: isApprooving ? (stateUpdateObject.val ?? stateUpdateObject.new!) : stateUpdateObject.old,
          };
        });
      const result = await SnapshotsApi.updateStates(runningNodeInfo?.idx ?? "", litOfUpdates);
      if (result.isOk) {
        dispatch(setUpdateAllButtonPressed(result.result!));
        if (result.result && trackLatestSidePanel) {
          dispatch(fetchOneSnapshot(Number(latestSnapshotId), Number(secondId), false, true));
        }
      }
    },
    [filteredOptions]
  );

  const handleApprove = useCallback(
    (isApproved: boolean) => {
      if (isApproved) setApproved(approved + 1);
    },
    [approved]
  );

  if (pendingCount === 0) return <span className={styles.noUpdates}>No state updates available.</span>;

  return (
    <>
      <div className={styles.stateWrapper} data-testid="state-wrapper">
        <InputField
          dataTestId="search-field"
          inputClassName={styles.stateUpdatesSearch}
          name="search"
          type="search"
          value={searchValue}
          placeholder={"Search parameters (e.g., q2, frequency)..."}
          autoComplete="off"
          onChange={setSearch}
        />
        {filteredOptions.length > 0 && (
          <div className={styles.stateUpdateBulkButtons} data-testid="state-title">
            <Button
              className={classNames(styles.statetUpdateBulkButton, styles.reject)}
              data-testid="update-all-button"
              disabled={updateAllButtonPressed}
              onClick={() => handleClick(false)}
            >
              ✕ Reject All
            </Button>
            <Button
              className={classNames(styles.statetUpdateBulkButton, styles.approve)}
              data-testid="update-all-button"
              disabled={updateAllButtonPressed}
              onClick={() => handleClick(true)}
            >
              ✓ Accept All
            </Button>
          </div>
        )}
      </div>
      {filteredOptions.length ? (
        <div className={styles.stateUpdatesTopWrapper} data-testid="state-updates-top-wrapper">
          {filteredOptions.map(([key, stateUpdateObject], index) => (
            <StateUpdateElement
              key={key}
              stateKey={key}
              index={index}
              title={getHighlightedText(key, searchValue)}
              onApprove={handleApprove}
              stateUpdateObject={stateUpdateObject}
              runningNodeInfo={runningNodeInfo}
              updateAllButtonPressed={updateAllButtonPressed}
            />
          ))}
        </div>
      ) : (
        <span className={styles.noUpdates}>No state updates found.</span>
      )}
      <div className={styles.stateUpdatesFooter}>
        <span className={classNames(styles.stateUpdatesFooterValue, styles.total)}>
          Total: <span>{Object.keys(runningNodeInfo?.state_updates || []).length}</span>
        </span>
        <span className={classNames(styles.stateUpdatesFooterValue, styles.pending)}>
          Pending: <span>{pendingCount}</span>
        </span>
        <span className={classNames(styles.stateUpdatesFooterValue, styles.approved)}>
          Approved: <span>{approved}</span>
        </span>
      </div>
    </>
  );
};
