import React from "react";
import styles from "./MeasurementHistory.module.scss";
import { Measurement } from "../../context/GraphStatusContext";
import { MeasurementElementList } from "../MeasurementElementList/MeasurementElementList";

// eslint-disable-next-line css-modules/no-unused-class

export interface IMeasurementHistoryListProps {
  title?: string;
  listOfMeasurements?: Measurement[];
}

export const MeasurementHistory: React.FC<IMeasurementHistoryListProps> = ({ title = "Execution history", listOfMeasurements }) => {
  return (
    <div className={styles.wrapper}>
      <div className={styles.titleRow}>
        <div className={styles.title}>{title}</div>
        {/*<div>*/}
        {/*  <Checkbox checked={false} inputProps={{ "aria-label": "controlled" }} />*/}
        {/*  Track latest*/}
        {/*</div>*/}
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
