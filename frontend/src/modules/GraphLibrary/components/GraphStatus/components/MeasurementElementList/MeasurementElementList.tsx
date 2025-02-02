import React, { useState, useEffect, useRef } from "react";
import { IMeasurementHistoryListProps } from "../MeasurementHistory/MeasurementHistory";
import styles from "./MeasurementElementList.module.scss";
import { MeasurementElement } from "../MeasurementElement/MeasurementElement";

export const MeasurementElementList: React.FC<IMeasurementHistoryListProps> = ({ listOfMeasurements }) => {
  const [expandedElement, setExpandedElement] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null); // Reference to the outer container

  const handleExpand = (name: string) => {
    setExpandedElement((prev) => (prev === name ? null : name)); // Toggle expansion
  };

  useEffect(() => {
    // Ensure inner content fully utilizes the width of the container dynamically
    if (containerRef.current) {
      containerRef.current.style.width = "100%";
    }
  }, [expandedElement]);

  return (
    <div ref={containerRef} className={styles.outerContainer}>
      <div
        className={`${styles.wrapper} ${
          expandedElement ? styles.expandedWrapper : styles.collapsedWrapper
        }`}
      >
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
    </div>
  );
};
