import React from "react";
import { SnapshotDTO } from "../../../Snapshots/SnapshotDTO";
import styles from "../SnapshotElement/SnapshotElement.module.scss";
// eslint-disable-next-line css-modules/no-unused-class
import additionalStyles from "../../../GraphLibrary/components/GraphStatus/components/MeasurementElement/MeasurementElement.module.scss";
import { MeasurementElementStatusInfoAndParameters } from "../../../GraphLibrary/components/GraphStatus/components/MeasurementElementInfoSection/MeasurementElementInfoSection";

export const SnapshotElement: React.FC<{ el: SnapshotDTO; isSelected: boolean; handleOnClick: () => void }> = ({
  el,
  isSelected,
  handleOnClick,
}) => {
  const formatDateTime = (dateTime: string): string => {
    const date = new Date(dateTime);
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
  };
  return (
    <div className={styles.wrapper}>
      <div className={styles.headerWrapper} onClick={handleOnClick}>
        <div className={styles.titleWrapper}>
          <div className={additionalStyles.dot} />
        </div>
        <div className={styles.idWrapper}>#{el.id}</div>
        <div className={styles.nameWrapper}>{el.metadata?.name}</div>
      </div>
      {isSelected && (
        <div className={additionalStyles.expandedContent}>
          <div className={additionalStyles.runInfoAndParameters}>
            <MeasurementElementStatusInfoAndParameters
              data={{
                // Status: "aaa",
                // "Run duration": `${"element.run_duration"}s`,
                "Run start": formatDateTime(el.created_at),
              }}
              isInfoSection={true}
              className={additionalStyles.runInfo}
              evenlySpaced={true}
            />
            <MeasurementElementStatusInfoAndParameters
              title="Parameters"
              data={{}}
              filterEmpty={true}
              className={additionalStyles.parameters}
            />
          </div>
        </div>
      )}
    </div>
  );
};
