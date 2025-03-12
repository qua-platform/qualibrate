import React from "react";
import { MenuCard } from "../../contexts/TitleBarMenuContext";
import styles from "./styles/TitleBarMenuCard.module.scss";
// import CircularLoader from "../../ui-lib/Icons/CircularLoader";
import CircularLoaderPercentage from "../../ui-lib/Icons/CircularLoaderPercentage";

interface IProps {
  card: MenuCard;
}

const TitleBarMenuCard: React.FC<IProps> = ({ card }) => {
  const { label, value, tooltipIcon, spinnerIconText, dot, id, percentage } = card;
  const isRunning = spinnerIconText === "Running";
  
  return (
    <div className={styles.wrapper}>
      {isRunning && (
        <div className={styles.spinnerWrapper}>
          <CircularLoaderPercentage percentage={percentage ?? 0} />
        </div>
      )}
      <div className={styles.contentWrapper}>
        <div className={styles.labelRow}>
          <div className={styles.labelColumn}>{label}:</div>
          <div className={styles.valueColumn}>{value}&nbsp;{tooltipIcon}</div>
        </div>
        <div className={styles.statusRow}>
          <div className={styles.statusText}>{spinnerIconText}</div>
          <div className={styles.timeRemaining}>{id}</div>
        </div>
      </div>
    </div>
  );
};

export default TitleBarMenuCard;
