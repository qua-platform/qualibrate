import React from "react";

import styles from "./MeasurementHistory.module.scss";
import { Measurement } from "../../context/GraphStatusContext";
import { MeasurementElementList } from "../MeasurementElementList/MeasurementElementList";
import LoaderPage from "../../../../../../ui-lib/loader/LoaderPage";

// eslint-disable-next-line css-modules/no-unused-class

export interface IMeasurementHistoryListProps {
  title?: string;
  listOfMeasurements?: Measurement[];
}

export const MeasurementHistory: React.FC<IMeasurementHistoryListProps> = ({ title = "Execution history", listOfMeasurements }) => {
  if (!listOfMeasurements) {
    return (
      <div className={styles.contentContainer}>
        <LoaderPage />
      </div>
    );
  }
  return (
    <div className={styles.wrapper}>
      <div className={styles.titleRow}>
        <div className={styles.title}>{title}</div>
        {/*<div>*/}
        {/*  <Checkbox checked={false} inputProps={{ "aria-label": "controlled" }} />*/}
        {/*  Track latest*/}
        {/*</div>*/}
      </div>
      {listOfMeasurements && (
        <div className={styles.contentContainer}>
          <div className={styles.upperContainer}></div>
          <div className={styles.lowerContainer}>
            <MeasurementElementList listOfMeasurements={listOfMeasurements} />
          </div>
        </div>
      )}
    </div>
  );
  // return (
  //   listOfMeasurements && (
  //     <div className={styles.listWrapper}>
  //       {Object.entries(listOfMeasurements).map(([key, node]) => {
  //         return <MeasurementElement key={key} nodeKey={key} node={node} />;
  //       })}
  //     </div>
  //   )
  // );
};
