import React from "react";
import styles from "./ListCard.module.scss";
import { classNames } from "../../utils";
import { Tooltip } from "@mui/material";

interface IListCard {
  isHighlighted: boolean;
  onClick: () => void;
  title: React.ReactNode;
  executionStatus?: string;
  statusTooltip?: string;
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

const ListCard = ({ isHighlighted, onClick, title, executionStatus = "", statusTooltip, description, footer }: IListCard) => (
  <div className={classNames(styles.listCard, isHighlighted && styles.selected)} onClick={onClick}>
    <div className={styles.header}>
      <div className={styles.headerLeft}>
        <Tooltip title={title} placement="right-end" arrow>
          <span className={styles.title}>{title}</span>
        </Tooltip>
      </div>
      <Tooltip title={statusTooltip} placement="right-end" arrow>
        <div className={classNames(styles.status, statusClassMap[executionStatus])}>
          <div className={styles.statusDot} />
          {executionStatus}
        </div>
      </Tooltip>
    </div>
    <div className={styles.description}>{description}</div>
    {footer && footer}
  </div>
);

export default ListCard;
