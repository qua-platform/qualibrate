import React from "react";
import { IMeasurementHistoryListProps } from "../MeasurementHistory/MeasurementHistory";
import styles from "./MeasurementElementList.module.scss";
import { MeasurementElement } from "../MeasurementElement/MeasurementElement";
import { classNames } from "../../../../../../utils/classnames";
import { useSelectionContext } from "../../../../../common/context/SelectionContext";

export const MeasurementElementList: React.FC<IMeasurementHistoryListProps> = ({ listOfMeasurements }) => {
  const { selectedItemName } = useSelectionContext();

  return (
    <div className={styles.outerContainer}>
      <div
        className={classNames(
          styles.wrapper,
          selectedItemName && selectedItemName !== "" ? styles.expandedWrapper : styles.collapsedWrapper
        )}
      >
        {(listOfMeasurements ?? []).map((el, index) => (
          <div
            key={`${el.snapshot_idx ?? el.name ?? "-"}-${index}`}
            data-measurement-id={el.name} // Unique selector for querying
          >
            <MeasurementElement element={el} />
          </div>
        ))}
      </div>
    </div>
  );
};
