import React, { useState, useEffect } from "react";
import { IMeasurementHistoryListProps } from "../MeasurementHistory/MeasurementHistory";
import styles from "./MeasurementElementList.module.scss";
import { MeasurementElement } from "../MeasurementElement/MeasurementElement";
import { classNames } from "../../../../../../utils/classnames";

export const MeasurementElementList: React.FC<IMeasurementHistoryListProps> = ({ listOfMeasurements }) => {
  const [expandedElement, setExpandedElement] = useState<string | null>(null);

  const handleExpand = (name: string) => {
    setExpandedElement((prev) => (prev === name ? null : name));
  };

  useEffect(() => {
    if (expandedElement) {
      const element = document.querySelector(`[data-measurement-id="${expandedElement}"]`);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    }
  }, [expandedElement]);

  return (
    <div className={styles.outerContainer}>
      <div
        className={classNames(
          styles.wrapper,
          expandedElement ? styles.expandedWrapper : styles.collapsedWrapper
        )}
      >
        {(listOfMeasurements ?? []).map((el, index) => (
          <div
            key={`${el.snapshot_idx ?? el.name ?? "-"}-${index}`}
            data-measurement-id={el.name} // Unique selector for querying
          >
            <MeasurementElement
              element={el}
              isExpanded={expandedElement === el.name}
              onExpand={() => handleExpand(el.name)}
            />
          </div>
        ))}
      </div>
    </div>
  );
};
