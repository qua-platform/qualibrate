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
import React, {useEffect, useState} from "react";
import {useSelector} from "react-redux";
import styles from "./MeasurementHistory.module.scss";
import {MeasurementElementList} from "../MeasurementElementList/MeasurementElementList";
import {useRootDispatch} from "../../../../stores";
import {
  getAllMeasurements,
  getTrackLatest,
  setTrackLatest,
  Measurement,
  setGraphStatusSelectedNodeNameInWorkflow,
} from "../../../../stores/GraphStores/GraphStatus";
import {getTrackLatestSidePanel, fetchOneSnapshot, setDiffData, setLatestSnapshotId, setResult} from "../../../../stores/SnapshotsStore";

interface IMeasurementHistoryListProps {
  title?: string;
}

export const MeasurementHistory: React.FC<IMeasurementHistoryListProps> = ({ title = "Execution history" }) => {
  const dispatch = useRootDispatch();
  const allMeasurements = useSelector(
    getAllMeasurements,
    (prev?: Measurement[], current?: Measurement[]) => JSON.stringify(prev) === JSON.stringify(current)
  );
  const trackLatest = useSelector(getTrackLatest);
  const trackLatestSidePanel = useSelector(getTrackLatestSidePanel);
  const [latestId, setLatestId] = useState<number | undefined>();
  const [latestName, setLatestName] = useState<string | undefined>();

  const handleOnClick = () => {
    dispatch(setTrackLatest(!trackLatest));
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

          dispatch(setGraphStatusSelectedNodeNameInWorkflow(element?.metadata?.name));
          if (element.id) {
            dispatch(setLatestSnapshotId(element.id));
            if (trackLatestSidePanel) {
              dispatch(fetchOneSnapshot(element.id, element.id - 1, true, true));
            } else {
              dispatch(fetchOneSnapshot(element.id));
            }
          } else {
            dispatch(setResult({}));
            dispatch(setDiffData({}));
          }
        }
      }
    }
  }, [trackLatest, allMeasurements, latestId, latestName]);

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
          <MeasurementElementList listOfMeasurements={allMeasurements} />
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
