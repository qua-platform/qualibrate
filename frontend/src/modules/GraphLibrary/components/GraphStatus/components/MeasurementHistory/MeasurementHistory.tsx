import React, { useEffect } from "react";
import styles from "./MeasurementHistory.module.scss";
import { Measurement, useGraphStatusContext } from "../../context/GraphStatusContext";
import { MeasurementElementList } from "../MeasurementElementList/MeasurementElementList";
import { useSelectionContext } from "../../../../../common/context/SelectionContext";
import { useGraphContext } from "../../../../context/GraphContext";

export interface IMeasurementHistoryListProps {
  title?: string;
  listOfMeasurements?: Measurement[];
}

export const MeasurementHistory: React.FC<IMeasurementHistoryListProps> = ({
  title = "Execution history",
  listOfMeasurements,
}) => {
  const {
    allMeasurements,
    fetchResultsAndDiffData,
    setResult,
    setDiffData,
    trackLatest,
    setTrackLatest,
  } = useGraphStatusContext();
  const { setSelectedNodeNameInWorkflow } = useGraphContext();
  const { setSelectedItemName } = useSelectionContext();

  const handleOnClick = () => {
    setTrackLatest(!trackLatest);
  };

  useEffect(() => {
    if (trackLatest) {
      if (allMeasurements) {
        const element = allMeasurements[0];
        if (element) {
          setSelectedItemName(element?.name);
          setSelectedNodeNameInWorkflow(allMeasurements[0]?.name);

          if (element.snapshot_idx) {
            fetchResultsAndDiffData(element.snapshot_idx);
          } else {
            setResult({});
            setDiffData({});
          }
        }
      }
    }
  }, [trackLatest, allMeasurements]);

  return (
    <div className={styles.wrapper}>
      <div className={styles.titleRow}>
        <div className={styles.title}>{title}</div>
        <div className={styles.trackLatestWrapper}>
          <span>Track latest</span>
          <div
            className={`${styles.toggleSwitch} ${
              trackLatest ? styles.on : styles.off
            }`}
            onClick={handleOnClick}
          >
            <div
              className={`${styles.toggleKnob} ${
                trackLatest ? styles.on : styles.off
              }`}
            ></div>
          </div>
        </div>
      </div>
      {listOfMeasurements && listOfMeasurements?.length > 0 && (
        <div className={styles.contentContainer}>
          <div className={styles.lowerContainer}>
            <MeasurementElementList listOfMeasurements={listOfMeasurements} />
          </div>
        </div>
      )}
      {(!listOfMeasurements || listOfMeasurements?.length === 0) && (
        <div className={styles.contentContainer}>
          <div className={styles.lowerContainer}>No measurements found</div>
        </div>
      )}
    </div>
  );
};
