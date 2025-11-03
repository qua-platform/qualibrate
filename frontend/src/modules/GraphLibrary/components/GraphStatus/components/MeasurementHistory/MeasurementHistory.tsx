/**
 * @fileoverview Execution history panel with "track latest" auto-selection.
 *
 * Displays list of measurements from recent graph executions. When "track latest"
 * is enabled, automatically selects and displays results from the most recent
 * measurement as they arrive via WebSocket updates.
 *
 * @see GraphStatusContext - Provides allMeasurements and trackLatest state
 * @see MeasurementElementList - Renders the measurement list
 */
import React, { useEffect, useState } from "react";
import styles from "./MeasurementHistory.module.scss";
import { useGraphStatusContext } from "../../context/GraphStatusContext";
import { MeasurementElementList } from "../MeasurementElementList/MeasurementElementList";
import { useSelectionContext } from "../../../../../common/context/SelectionContext";
import { useGraphContext } from "../../../../context/GraphContext";
import { useSnapshotsContext } from "../../../../../Snapshots/context/SnapshotsContext";

interface IMeasurementHistoryListProps {
  title?: string;
}

export const MeasurementHistory: React.FC<IMeasurementHistoryListProps> = ({ title = "Execution history" }) => {
  const { allMeasurements, trackLatest, setTrackLatest } = useGraphStatusContext();
  const { trackLatestSidePanel, fetchOneSnapshot, setLatestSnapshotId, setResult, setDiffData } = useSnapshotsContext();
  const { setSelectedNodeNameInWorkflow } = useGraphContext();
  const { setSelectedItemName } = useSelectionContext();
  const [latestId, setLatestId] = useState<number | undefined>();
  const [latestName, setLatestName] = useState<string | undefined>();

  const handleOnClick = () => {
    setTrackLatest(!trackLatest);
  };

  /**
   * Auto-selects latest measurement when trackLatest is enabled.
   * Fetches snapshot with diff data if trackLatestSidePanel is enabled.
   * Only updates if latest measurement ID or name has changed.
   */
  useEffect(() => {
    if (trackLatest) {
      if (allMeasurements) {
        const element = allMeasurements[0];

        if (element && (element.id !== latestId || element.metadata?.name !== latestName)) {
          setLatestId(element.id);
          setLatestName(element.metadata?.name);
          setSelectedItemName(element?.metadata?.name);

          setSelectedNodeNameInWorkflow(allMeasurements[0]?.metadata?.name);
          if (element.id) {
            setLatestSnapshotId(element.id);
            if (trackLatestSidePanel) {
              fetchOneSnapshot(element.id, element.id - 1, true, true);
            } else {
              fetchOneSnapshot(element.id);
            }
          } else {
            setResult({});
            setDiffData({});
          }
        }
      }
    }
  }, [trackLatest, setTrackLatest, allMeasurements, latestId, latestName]);

  return (
    <div className={styles.wrapper}>
      <div className={styles.titleRow}>
        <div className={styles.title}>{title}</div>
        <div className={styles.trackLatestWrapper}>
          <span>Track latest</span>
          <div className={`${styles.toggleSwitch} ${trackLatest ? styles.toggleOn : styles.toggleOff}`} onClick={handleOnClick}>
            <div className={`${styles.toggleKnob} ${trackLatest ? styles.toggleOn : styles.toggleOff}`}></div>
          </div>
        </div>
      </div>
      {allMeasurements && allMeasurements?.length > 0 && (
        <div className={styles.contentContainer}>
          {/*<div className={styles.lowerContainer}>*/}
          <MeasurementElementList listOfMeasurements={allMeasurements} />
          {/*</div>*/}
        </div>
      )}
      {(!allMeasurements || allMeasurements?.length === 0) && (
        <div className={styles.contentContainer}>
          <div className={styles.lowerContainer}>No measurements found</div>
        </div>
      )}
    </div>
  );
};
