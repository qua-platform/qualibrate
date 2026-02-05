import React from "react";
import styles from "./AppliedFilterLabel.module.scss";

type Props = {
    label?: string;
    showDot?: boolean;
    dotColor?: string;
    value: string | React.JSX.Element;
    onRemove: () => void;
};

const AppliedFilterLabel: React.FC<Props> = ({label, showDot = false, dotColor = "#123", value, onRemove}) => {
    return (
        <div className={styles.selectedFiltersRow}>
            <div className={styles.activeDateFilter}>
                {label && <span className={styles.filterLabel}>{label}</span>}
                {showDot && <div data-testid="filter-dot" className={styles.dot} style={{backgroundColor: dotColor ?? ""}}/>}
                <span>{value}</span>
                <span className={styles.removeFilter} onClick={onRemove}>
          ×
        </span>
            </div>
        </div>
    );
};
export default AppliedFilterLabel;
