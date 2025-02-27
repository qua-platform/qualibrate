import React from "react";
import { SnapshotDTO } from "../../../Snapshots/SnapshotDTO";
import styles from "../SnapshotElement/SnapshotElement.module.scss";
// eslint-disable-next-line css-modules/no-unused-class
import additionalStyles from "../../../GraphLibrary/components/GraphStatus/components/MeasurementElement/MeasurementElement.module.scss";
import {
  MeasurementElementOutcomes,
  MeasurementElementStatusInfoAndParameters,
} from "../../../GraphLibrary/components/GraphStatus/components/MeasurementElementInfoSection/MeasurementElementInfoSection";
import { classNames } from "../../../../utils/classnames";

export const SnapshotElement: React.FC<{ el: SnapshotDTO; isSelected: boolean; handleOnClick: () => void }> = ({
  el,
  isSelected,
  handleOnClick,
}) => {
  const formatDateTime = (dateTimeString: string) => {
    const [date, time] = dateTimeString.split("T");
    const [timeWithoutMilliseconds] = time.split("+");
    return `${date} ${timeWithoutMilliseconds}`;
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
                ...(el.status !== undefined && { Status: el.status }),
                ...(el.run_duration !== undefined && { "Run duration": `${el.run_duration}s` }),
                ...(el.run_start !== undefined && { "Run start": formatDateTime(el.run_start) }),
                "Run end": formatDateTime(el.created_at),
              }}
              isInfoSection={true}
              className={classNames(additionalStyles.runInfo, styles.additionalWidth)}
              evenlySpaced={true}
            />
            <MeasurementElementStatusInfoAndParameters
              title="Parameters"
              data={el.parameters}
              filterEmpty={true}
              className={classNames(additionalStyles.parameters, styles.additionalWidth)}
            />
          </div>
          <MeasurementElementOutcomes outcomes={el.outcomes} />
        </div>
      )}
    </div>
  );
};
