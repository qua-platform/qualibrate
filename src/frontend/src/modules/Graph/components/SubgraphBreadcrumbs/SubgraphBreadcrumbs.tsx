import React from "react";
import styles from "./SubgraphBreadcrumbs.module.scss";
import { classNames } from "../../../../utils/classnames";

const SubgraphBreadcrumbs = ({
  className,
  subgraphBreadcrumbs,
  selectedWorkflowName,
  onBreadcrumbClick,
}: {
  className?: string
  subgraphBreadcrumbs: string[]
  selectedWorkflowName: string | undefined
  onBreadcrumbClick: (index: number) => void
}) => (
  <div className={classNames(styles.breadcrumbsContainer, className)}>
    {subgraphBreadcrumbs.length !== 0 &&
      <button
        key={"reset"}
        className={styles.breadcrumbsButton}
        onClick={() => onBreadcrumbClick(0)}
      >
        {selectedWorkflowName}
      </button>
    }
    {subgraphBreadcrumbs.map((key, index) => <React.Fragment key={`${key}_${index}`}>
      <span className={styles.breadcrumbsSeparator}>→</span>
      <button
        className={styles.breadcrumbsButton}
        onClick={() => onBreadcrumbClick(index + 1)}
        disabled={index === subgraphBreadcrumbs.length - 1}
      >
        {key}
      </button>
    </React.Fragment>
    )}
  </div>
);

export default SubgraphBreadcrumbs;
