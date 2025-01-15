import React, { useEffect } from "react";
// eslint-disable-next-line css-modules/no-unused-class
import styles from "./MeasurementHistory.module.scss";
import { Measurement, useGraphStatusContext } from "../../context/GraphStatusContext";
import { MeasurementElementList } from "../MeasurementElementList/MeasurementElementList";
import { Checkbox } from "@mui/material";
import { useSelectionContext } from "../../../../../common/context/SelectionContext";
import { useGraphContext } from "../../../../context/GraphContext";

export interface IMeasurementHistoryListProps {
  title?: string;
  listOfMeasurements?: Measurement[];
}

export const MeasurementHistory: React.FC<IMeasurementHistoryListProps> = ({ title = "Execution history", listOfMeasurements }) => {
  const { allMeasurements, fetchResultsAndDiffData, setResult, setDiffData, trackLatest, setTrackLatest } = useGraphStatusContext();
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
          <Checkbox
            className={styles.trackLatestCheckbox}
            checked={trackLatest}
            inputProps={{ "aria-label": "controlled" }}
            onClick={handleOnClick}
          />
          Track latest
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
