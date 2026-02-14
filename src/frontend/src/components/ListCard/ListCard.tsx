import React from "react";
import styles from "./ListCard.module.scss";
import { classNames } from "../../utils/classnames";

interface IListCard {
  isHighlighted: boolean;
  onClick: () => void;
  title: string;
  executionStatus?: string;
  description: React.ReactNode;
  footer?: React.ReactNode;
}

const statusClassMap: Record<string, string> = {
  running: styles.statusRunning,
  pending: styles.statusPending,
  completed: styles.statusSuccess,
  success: styles.statusSuccess,
  failure: styles.statusFailure,
  error: styles.statusError,
};

const ListCard = ({ isHighlighted, onClick, title, executionStatus = "", description, footer }: IListCard) => (
  <div className={classNames(styles.listCard, isHighlighted && styles.selected)} onClick={onClick}>
    <div className={styles.header}>
      <div className={styles.headerLeft}>
        <span className={styles.title} title={title}>
          {title}
        </span>
      </div>
      <div className={classNames(styles.status, statusClassMap[executionStatus])}>
        <div className={styles.statusDot} />
        {executionStatus}
      </div>
    </div>
    <div className={styles.description}>{description}</div>
    {footer && footer}
  </div>
);

export default ListCard;
