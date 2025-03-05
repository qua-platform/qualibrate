import React from "react";
import { MenuCard } from "../../contexts/TitleBarMenuContext";
import styles from "./styles/TitleBarMenuCard.module.scss";
import CircularLoader from "../../ui-lib/Icons/CircularLoader";

interface IProps {
  card: MenuCard;
}

const TitleBarMenuCard: React.FC<IProps> = ({ card }) => {
  const { label, value, tooltipIcon, spinnerIcon, spinnerIconText, dot, id } = card;
  return (
    <div className={styles.wrapper}>
      <div className={styles.rowWrapper}>
        <div className={styles.labelColumnWrapper}>{label}:</div>
        <div className={styles.valueColumnWrapper}>
          {value}&nbsp;{tooltipIcon}
        </div>
      </div>
      <div className={styles.rowWrapper}>
        <div className={styles.labelColumnWrapper}>
          <div>
            <CircularLoader />
          </div>
          {spinnerIcon}
          {spinnerIconText}
        </div>
        <div className={styles.valueColumnWrapper}>
          {dot ? (
            <div className={styles.dotWrapper}>
              <div className={styles.dot} />
            </div>
          ) : null}
          &nbsp;{id}
        </div>
      </div>
    </div>
  );
};

export default TitleBarMenuCard;
