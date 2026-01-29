import React from "react";
import styles from "./AppliedFilterLabel.module.scss";

type Props = {
  label?: string;
  value: string;
  onRemove: () => void;
};

const AppliedFilterLabel: React.FC<Props> = ({ label, value, onRemove }) => {
  return (
    <div className={styles.selectedFiltersRow}>
      <div className={styles.activeDateFilter}>
        {label && <span className={styles.filterLabel}>{label}</span>}
        {!label && <div data-testid="filter-dot" className={styles.dot} />}
        <span>{value}</span>
        <span className={styles.removeFilter} onClick={onRemove}>
          ×
        </span>
      </div>
    </div>
  );
};
export default AppliedFilterLabel;
