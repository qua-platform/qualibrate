import React, { useEffect, useState } from "react"; // eslint-disable-next-line css-modules/no-unused-class
import styles from "./styles/QuamPanel.module.scss";
import { JSONEditor } from "../../../components";
import { PanelHeader } from "./components/PanelHeader/PanelHeader";
import { PanelUpdates } from "./components/PanelUpdates/PanelUpdates";
import { useSelector } from "react-redux";
import { useRootDispatch } from "../../../stores";
import {
  getClickedForSnapshotSelection,
  getDiffData,
  getFirstId,
  getJsonDataSidePanel,
  getLatestSnapshotId,
  getSecondId,
  getSelectedSnapshotId,
  getTrackLatestSidePanel,
  getTrackPreviousSnapshot,
  fetchOneSnapshot,
  setClickedForSnapshotSelection,
  setFirstId,
  setSecondId,
  setTrackLatestSidePanel,
  setTrackPreviousSnapshot
} from "../../../stores/SnapshotsStore";

export const QuamPanel = () => {
  // const [trackLatestSidePanel, setTrackLatestSidePanel] = useState(true);
  // const [trackPreviousSnapshot, setTrackPreviousSnapshot] = useState(true);
  const [firstIdSelectionMode, setFirstIdSelectionMode] = useState("latest");
  const dispatch = useRootDispatch();

  const trackLatestSidePanel = useSelector(getTrackLatestSidePanel);
  const trackPreviousSnapshot = useSelector(getTrackPreviousSnapshot);
  const jsonDataSidePanel = useSelector(getJsonDataSidePanel);
  const diffData = useSelector(getDiffData);
  const latestSnapshotId = useSelector(getLatestSnapshotId);
  const selectedSnapshotId = useSelector(getSelectedSnapshotId);
  const clickedForSnapshotSelection = useSelector(getClickedForSnapshotSelection);
  const firstId = useSelector(getFirstId);
  const secondId = useSelector(getSecondId);

  // const { selectedPageName } = useFlexLayoutContext();

  useEffect(() => {
    if (clickedForSnapshotSelection) {
      setFirstIdSelectionMode("selection");
      dispatch(setTrackLatestSidePanel(false));
      if (trackPreviousSnapshot) {
        dispatch(fetchOneSnapshot(Number(selectedSnapshotId), Number(selectedSnapshotId) - 1, false, true));
      } else {
        dispatch(fetchOneSnapshot(Number(selectedSnapshotId), Number(secondId), false, true));
      }
      dispatch(setClickedForSnapshotSelection(false));
    }
  }, [clickedForSnapshotSelection]);

  useEffect(() => {
    if (trackPreviousSnapshot) {
      dispatch(setSecondId((firstId && Number(firstId) - 1 >= 0 ? Number(firstId) - 1 : 0).toString()));
    }
  }, [firstId, trackPreviousSnapshot]);

  useEffect(() => {
    // if (selectedPageName === "data") {
    if (firstIdSelectionMode === "latest") {
      dispatch(setFirstId(latestSnapshotId?.toString() ?? "0"));
    } else if (firstIdSelectionMode === "selection") {
      dispatch(setFirstId(selectedSnapshotId?.toString() ?? "0"));
      if (latestSnapshotId && selectedSnapshotId && latestSnapshotId === selectedSnapshotId) {
        dispatch(setTrackLatestSidePanel(true));
      } else {
        dispatch(setTrackLatestSidePanel(false));
      }
      // setFirstIdSelectionMode("selection");
    } else if (firstIdSelectionMode === "input") {
      dispatch(setTrackLatestSidePanel(false));
      dispatch(setClickedForSnapshotSelection(false));
    }
    // }
  }, [firstIdSelectionMode, selectedSnapshotId, latestSnapshotId]);

  const onConfirm = (value: string, isFirstId: boolean) => {
    if (isFirstId) {
      dispatch(setFirstId(value));
    } else {
      dispatch(setSecondId(value));
    }
    dispatch(fetchOneSnapshot(Number(firstId), Number(secondId), false, true));
  };

  const onFocus = () => {
    setFirstIdSelectionMode("input");
  };

  const onToggleTrackLatest = () => {
    if (!trackLatestSidePanel) {
      setFirstIdSelectionMode("latest");
      dispatch(setClickedForSnapshotSelection(false));
      dispatch(fetchOneSnapshot(Number(latestSnapshotId), Number(latestSnapshotId) - 1, false, true));
    } else {
      setFirstIdSelectionMode("selection");
      if (trackPreviousSnapshot) {
        dispatch(fetchOneSnapshot(Number(selectedSnapshotId), Number(selectedSnapshotId) - 1, false, true));
      } else {
        dispatch(fetchOneSnapshot(Number(selectedSnapshotId), Number(secondId), false, true));
      }
    }
    dispatch(setTrackLatestSidePanel(!trackLatestSidePanel));
  };
  const onToggleTrackPrevious = () => {
    if (!trackPreviousSnapshot) {
      if (trackLatestSidePanel) {
        dispatch(fetchOneSnapshot(Number(latestSnapshotId), Number(latestSnapshotId) - 1, false, true));
      } else {
        dispatch(fetchOneSnapshot(Number(selectedSnapshotId), Number(selectedSnapshotId) - 1, false, true));
      }
    } else {
      dispatch(fetchOneSnapshot(Number(firstId), Number(secondId), false, true));
    }
    dispatch(setTrackPreviousSnapshot(!trackPreviousSnapshot));
  };

  return (
    <>
      <PanelHeader
        trackLatest={trackLatestSidePanel}
        onToggleTrackLatest={onToggleTrackLatest}
        onIdChange={(value) => dispatch(setFirstId(value))}
        idValue={firstId}
        onConfirm={onConfirm}
        onFocus={onFocus}
      />
      <div className={styles.panelContent}>
        {jsonDataSidePanel && <JSONEditor title="" jsonDataProp={jsonDataSidePanel} height="100%" />}
      </div>
      <PanelUpdates
        previousSnapshot={trackPreviousSnapshot}
        onTogglePrevious={onToggleTrackPrevious}
        onSecondIdChange={(value) => dispatch(setSecondId(value))}
        // idValue={selectedSnapshotId && selectedSnapshotId - 1 > 0 ? selectedSnapshotId - 1 : 0}
        idValue={secondId}
        onConfirm={onConfirm}
      />
      <div className={styles.panelContent}>{diffData && <JSONEditor title="" jsonDataProp={diffData} height="94%" />}</div>
    </>
  );
};
