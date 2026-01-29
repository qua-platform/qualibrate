import React from "react";
import styles from "./QubitStatusList.module.scss";
import { SnapshotOutcomesType } from "../../../../stores/SnapshotsStore/api/SnapshotsApi";

interface Props {
  outcomes?: SnapshotOutcomesType;
}

const QubitStatusList: React.FC<Props> = ({ outcomes }) => {
  if (!outcomes) {
    return null;
  }
  return (
    <>
      {Object.entries(outcomes).map(([qubitName, data]) => {
        const isFailure = data.status === "failure";

        return (
          <div key={qubitName} className={styles.card}>
            <div className={styles.cardHeader}>
              <span className={styles.qubitName}>{qubitName}</span>

              <div className={styles.status}>
                <span className={`${styles.statusDot} ${isFailure ? styles.failure : styles.success}`} />
                <span className={`${styles.statusText} ${isFailure ? styles.failure : styles.success}`}>{data.status.toUpperCase()}</span>
              </div>
            </div>

            {isFailure && data.failed_on && (
              <div className={styles.failureInfo}>
                <div className={styles.failureLabel}>Failed on</div>
                <div className={styles.failureValue}>{data.failed_on}</div>
              </div>
            )}
          </div>
        );
      })}
    </>
  );
};
export default QubitStatusList;
