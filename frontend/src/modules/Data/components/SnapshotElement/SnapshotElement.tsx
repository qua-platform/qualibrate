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
import { useSnapshotsContext } from "../../../Snapshots/context/SnapshotsContext";
import { formatDateTime } from "../../../GraphLibrary/components/GraphStatus/components/MeasurementElement/MeasurementElement";

export const SnapshotElement: React.FC<{ el: SnapshotDTO; isSelected: boolean; handleOnClick: () => void }> = ({
  el,
  isSelected,
  handleOnClick,
}) => {
  const { jsonData } = useSnapshotsContext();
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
                ...(el.status && { Status: el.status }),
                ...(el.metadata?.run_duration && { "Run duration": `${el.metadata?.run_duration}s` }),
                ...(el.metadata?.run_start && {
                  "Run start": formatDateTime(el.metadata?.run_start),
                }),
                ...((el.metadata?.run_end || el.created_at) && {
                  "Run end": formatDateTime(el.metadata?.run_end ?? el.created_at),
                }),
              }}
              isInfoSection={true}
              className={classNames(additionalStyles.runInfo, styles.additionalWidth)}
              evenlySpaced={true}
            />
            <MeasurementElementStatusInfoAndParameters
              title="Parameters"
              data={(jsonData as { parameters: object })?.parameters}
              filterEmpty={true}
              className={classNames(additionalStyles.parameters, styles.additionalWidth)}
            />
          </div>
          <div className={styles.outcomesWrapper}>
            <MeasurementElementOutcomes outcomes={(jsonData as { outcomes: object })?.outcomes} />
          </div>
        </div>
      )}
    </div>
  );
};
