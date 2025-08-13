import React, { useEffect, useState } from "react"; // eslint-disable-next-line css-modules/no-unused-class
import styles from "./styles/QuamPanel.module.scss";
import { JSONEditor } from "../../Data/components/JSONEditor";
import { useSnapshotsContext } from "../../Snapshots/context/SnapshotsContext";
import { PanelHeader } from "./components/PanelHeader/PanelHeader";
import { PanelUpdates } from "./components/PanelUpdates/PanelUpdates";

export const QuamPanel = () => {
  // const [trackLatestSidePanel, setTrackLatestSidePanel] = useState(true);
  // const [trackPreviousSnapshot, setTrackPreviousSnapshot] = useState(true);
  const [firstIdSelectionMode, setFirstIdSelectionMode] = useState("latest");

  const {
    trackLatestSidePanel,
    setTrackLatestSidePanel,
    trackPreviousSnapshot,
    setTrackPreviousSnapshot,
    jsonDataSidePanel,
    diffData,
    fetchOneSnapshot,
    latestSnapshotId,
    selectedSnapshotId,
    clickedForSnapshotSelection,
    setClickedForSnapshotSelection,
    firstId,
    setFirstId,
    secondId,
    setSecondId,
  } = useSnapshotsContext();
  // const { selectedPageName } = useFlexLayoutContext();

  useEffect(() => {
    if (clickedForSnapshotSelection) {
      setFirstIdSelectionMode("selection");
      setTrackLatestSidePanel(false);
      if (trackPreviousSnapshot) {
        fetchOneSnapshot(Number(selectedSnapshotId), Number(selectedSnapshotId) - 1, false, true);
      } else {
        fetchOneSnapshot(Number(selectedSnapshotId), Number(secondId), false, true);
      }
      setClickedForSnapshotSelection(false);
    }
  }, [clickedForSnapshotSelection]);

  useEffect(() => {
    if (trackPreviousSnapshot) {
      setSecondId((firstId && Number(firstId) - 1 >= 0 ? Number(firstId) - 1 : 0).toString());
    }
  }, [firstId, setFirstId, trackPreviousSnapshot]);

  useEffect(() => {
    // if (selectedPageName === "data") {
    if (firstIdSelectionMode === "latest") {
      setFirstId(latestSnapshotId?.toString() ?? "0");
    } else if (firstIdSelectionMode === "selection") {
      setFirstId(selectedSnapshotId?.toString() ?? "0");
      if (latestSnapshotId && selectedSnapshotId && latestSnapshotId === selectedSnapshotId) {
        setTrackLatestSidePanel(true);
      } else {
        setTrackLatestSidePanel(false);
      }
      // setFirstIdSelectionMode("selection");
    } else if (firstIdSelectionMode === "input") {
      setTrackLatestSidePanel(false);
      setClickedForSnapshotSelection(false);
    }
    // }
  }, [firstIdSelectionMode, selectedSnapshotId, latestSnapshotId]);

  const onConfirm = (value: string, isFirstId: boolean) => {
    if (isFirstId) {
      setFirstId(value);
    } else {
      setSecondId(value);
    }
    fetchOneSnapshot(Number(firstId), Number(secondId), false, true);
  };

  const onFocus = () => {
    setFirstIdSelectionMode("input");
  };

  const onToggleTrackLatest = () => {
    if (!trackLatestSidePanel) {
      setFirstIdSelectionMode("latest");
      setClickedForSnapshotSelection(false);
      fetchOneSnapshot(Number(latestSnapshotId), Number(latestSnapshotId) - 1, false, true);
    } else {
      setFirstIdSelectionMode("selection");
      if (trackPreviousSnapshot) {
        fetchOneSnapshot(Number(selectedSnapshotId), Number(selectedSnapshotId) - 1, false, true);
      } else {
        fetchOneSnapshot(Number(selectedSnapshotId), Number(secondId), false, true);
      }
    }
    setTrackLatestSidePanel(!trackLatestSidePanel);
  };
  const onToggleTrackPrevious = () => {
    if (!trackPreviousSnapshot) {
      if (trackLatestSidePanel) {
        fetchOneSnapshot(Number(latestSnapshotId), Number(latestSnapshotId) - 1, false, true);
      } else {
        fetchOneSnapshot(Number(selectedSnapshotId), Number(selectedSnapshotId) - 1, false, true);
      }
    } else {
      fetchOneSnapshot(Number(firstId), Number(secondId), false, true);
    }
    setTrackPreviousSnapshot(!trackPreviousSnapshot);
  };

  return (
    <>
      <PanelHeader
        trackLatest={trackLatestSidePanel}
        onToggleTrackLatest={onToggleTrackLatest}
        onIdChange={setFirstId}
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
        onSecondIdChange={setSecondId}
        // idValue={selectedSnapshotId && selectedSnapshotId - 1 > 0 ? selectedSnapshotId - 1 : 0}
        idValue={secondId}
        onConfirm={onConfirm}
      />
      <div className={styles.panelContent}>{diffData && <JSONEditor title="" jsonDataProp={diffData} height="94%" />}</div>
    </>
  );
};
