import React, { useState } from "react";
import { IMeasurementHistoryListProps } from "../MeasurementHistory/MeasurementHistory";
import styles from "./MeasurementElementList.module.scss";
import { MeasurementElement } from "../MeasurementElement/MeasurementElement";

export const MeasurementElementList: React.FC<IMeasurementHistoryListProps> = ({ listOfMeasurements }) => {
  const [expandedElement, setExpandedElement] = useState<string | null>(null);

  const handleExpand = (name: string) => {
    setExpandedElement((prev) => (prev === name ? null : name)); // Toggle expansion
  };

  return (
    <div className={styles.wrapper}>
      {(listOfMeasurements ?? []).map((el, index) => (
        <div key={`${el.snapshot_idx ?? el.name ?? "-"}-${index}`}>
          <MeasurementElement
            element={el}
            isExpanded={expandedElement === el.name} // Pass expansion state
            onExpand={() => handleExpand(el.name)} // Pass expansion handler
          />
        </div>
      ))}
    </div>
  );
};
