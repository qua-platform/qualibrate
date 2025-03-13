import React from "react";
import { MenuCard } from "../../contexts/TitleBarMenuContext";
import styles from "./styles/TitleBarMenuCard.module.scss";
import CircularLoaderPercentage from "../../ui-lib/Icons/CircularLoaderPercentage";
import CheckmarkIcon from "../../ui-lib/Icons/CheckmarkIcon";
import ErrorIcon from "../../ui-lib/Icons/ErrorIcon";

interface IProps {
  card: MenuCard;
}

const TitleBarMenuCard: React.FC<IProps> = ({ card }) => {
  const { label, value, spinnerIconText, percentage, id } = card;
  const isRunning = spinnerIconText === "Running";
  const isFinished = spinnerIconText === "Finished";
  const isError = spinnerIconText === "Error";

  const wrapperClass = isRunning ? styles.running : isFinished ? styles.finished : styles.error;
  const statusClass = isRunning ? styles.statusRunning : isFinished ? styles.statusFinished : styles.statusError;

  return (
    <div className={`${styles.wrapper} ${wrapperClass}`}>
      <div className={styles.contentWrapper}>
        {/* Status Indicator */}
        <div className={styles.indicatorWrapper}>
          {isRunning ? (
            <CircularLoaderPercentage percentage={percentage ?? 0} />
          ) : isFinished ? (
            <CheckmarkIcon className={styles.checkmark} />
          ) : (
            <ErrorIcon className={styles.errorIcon} />
          )}
        </div>

        {/* Node Info */}
        <div className={styles.textWrapper}>
          <div className={styles.rowWrapper}>
            <span className={styles.label}>{label}:</span>
            <span className={styles.value}>{value}</span>
          </div>
          <div className={styles.rowWrapper}>
            <span className={`${styles.statusContainer} ${statusClass}`}>{spinnerIconText}</span>
            <span className={styles.timeRemaining}>{id}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TitleBarMenuCard;
