import React from "react";
import { MenuCard } from "../../contexts/TitleBarMenuContext";
import styles from "./styles/TitleBarMenuCard.module.scss";
// import CircularLoader from "../../ui-lib/Icons/CircularLoader";
import CircularLoaderPercentage from "../../ui-lib/Icons/CircularLoaderPercentage";

interface IProps {
  card: MenuCard;
}

const TitleBarMenuCard: React.FC<IProps> = ({ card }) => {
  const { label, value, spinnerIconText, percentage, id } = card;
  const isRunning = spinnerIconText === "Running";
  const isFinished = spinnerIconText === "Finished";
  const isError = !isRunning && !isFinished;

  const wrapperClass = isRunning ? styles.running : isFinished ? styles.finished : styles.error;
  const statusClass = isRunning ? styles.statusRunning : isFinished ? styles.statusFinished : styles.statusError;

  return (
    <div className={`${styles.wrapper} ${wrapperClass}`}>
      <div className={styles.contentWrapper}>
        {/* Progress Circle */}
        {isRunning && (
          <div className={styles.spinnerWrapper}>
            <CircularLoaderPercentage percentage={percentage ?? 0} />
          </div>
        )}

        {/* Node Info */}
        <div className={styles.textWrapper}>
          <div className={styles.rowWrapper}>
            <span className={styles.label}>{label}:</span>
            <span className={styles.value}>{value}</span>
          </div>
          <div className={styles.rowWrapper}>
            <span className={statusClass}>{spinnerIconText}</span>
            <span className={styles.timeRemaining}>{id}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TitleBarMenuCard;
