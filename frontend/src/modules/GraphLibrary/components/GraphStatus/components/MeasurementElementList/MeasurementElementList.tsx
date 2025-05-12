import React from "react";
import styles from "./MeasurementElementList.module.scss";
import { MeasurementElement } from "../MeasurementElement/MeasurementElement";
import { Measurement } from "../../context/GraphStatusContext";

interface IMeasurementElementListProps {
  listOfMeasurements: Measurement[];
}

export const MeasurementElementList: React.FC<IMeasurementElementListProps> = ({ listOfMeasurements }) => {
  return (
    <div className={styles.wrapper}>
      {listOfMeasurements.map((el, index) => (
        <MeasurementElement
          element={el}
          key={`${el.id ?? el.metadata?.name ?? "-"}-${index}`}
          dataMeasurementId={el.metadata?.name ?? ""}
        />
      ))}
    </div>
  );
};
