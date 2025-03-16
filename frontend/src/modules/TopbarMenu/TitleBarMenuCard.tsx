import React from "react";
import { MenuCard } from "../../contexts/TitleBarMenuContext";
import styles from "./styles/TitleBarMenuCard.module.scss";
import CircularLoaderPercentage from "../../ui-lib/Icons/CircularLoaderPercentage";
import CheckmarkIcon from "../../ui-lib/Icons/CheckmarkIcon";
import ErrorIcon from "../../ui-lib/Icons/ErrorIcon";
import { classNames } from "../../utils/classnames";

interface IProps {
  card: MenuCard;
}

const StatusIndicator: React.FC<{ status: string; percentage: number }> = ({ status, percentage }) => {
  if (status === "Running") {
    return <CircularLoaderPercentage percentage={percentage ?? 0} />;
  } else if (status === "Finished") {
    return <CheckmarkIcon />;
  } else {
    return <ErrorIcon />;
  }
};

const TitleBarMenuCard: React.FC<IProps> = ({ card }) => {
  const { label, value, spinnerIconText, percentage, id } = card;
  const isRunning = spinnerIconText === "Running";
  const isFinished = spinnerIconText === "Finished";

  const wrapperClass = isRunning ? styles.running : isFinished ? styles.finished : styles.error;
  const statusClass = isRunning ? styles.statusRunning : isFinished ? styles.statusFinished : styles.statusError;

  return (
    <div className={`${styles.wrapper} ${wrapperClass}`}>
      <div className={styles.contentWrapper}>
        {/* Status Indicator */}
        <div className={styles.indicatorWrapper}>
          <StatusIndicator status={spinnerIconText ?? "Unknown"} percentage={percentage ?? 0} />
        </div>

        {/* Node Info */}
        <div className={styles.textWrapper}>
          <div className={styles.rowWrapper}>
            <span>{label}:</span>
            <span>{value}</span>
          </div>
          <div className={styles.rowWrapper}>
            <span className={classNames(styles.statusContainer, statusClass)}>{spinnerIconText}</span>
            <span>{id}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TitleBarMenuCard;
