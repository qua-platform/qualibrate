import React from "react";
import { useSelector } from "react-redux";
import { getResult, getSelectedSnapshot } from "../../../../stores/SnapshotsStore";
import styles from "./QubitCard.module.scss";

const QubitCard: React.FC = () => {
  const result = useSelector(getResult);
  const selectedSnapshot = useSelector(getSelectedSnapshot);

  return (
    <div className={styles.qubitCard}>
      <div className={styles.qubitCardHeader}>
        <span className={styles.qubitName}>q3</span>

        <div className={styles.qubitStatus}>
          <div className={`${styles.statusDot} ${styles.failure}`} />
          <span className={`${styles.statusText} ${styles.failure}`}>FAILURE</span>
        </div>
      </div>

      <div className={styles.failureDetails}>
        <div className={styles.failureLabel}>Failed on</div>
        <div className={styles.failureValue}>Ramsey2</div>
      </div>
    </div>
  );
};
export default QubitCard;
