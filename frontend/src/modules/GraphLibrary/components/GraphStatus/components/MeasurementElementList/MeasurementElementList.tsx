/**
 * @fileoverview Simple list renderer for measurement elements.
 *
 * @see MeasurementElement - Individual list item component
 * @see MeasurementHistory - Parent component providing measurements array
 */
import React from "react";
import styles from "./MeasurementElementList.module.scss";
import { MeasurementElement } from "../MeasurementElement/MeasurementElement";
import { Measurement } from "../../GraphStatus";

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
