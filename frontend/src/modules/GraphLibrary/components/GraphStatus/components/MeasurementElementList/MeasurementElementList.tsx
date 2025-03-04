import React from "react";
import { IMeasurementHistoryListProps } from "../MeasurementHistory/MeasurementHistory";
import styles from "./MeasurementElementList.module.scss";
import { MeasurementElement } from "../MeasurementElement/MeasurementElement";

export const MeasurementElementList: React.FC<IMeasurementHistoryListProps> = ({ listOfMeasurements }) => {
  return (
    <div className={styles.wrapper}>
      {(listOfMeasurements ?? []).map((el, index) => (
        <MeasurementElement
          element={el}
          key={`${el.id ?? el.metadata?.name ?? "-"}-${index}`}
          dataMeasurementId={el.metadata?.name ?? ""}
        />
      ))}
    </div>
  );
};
