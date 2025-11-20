import React from "react";
import { useSelector } from "react-redux";
import styles from "./SubgraphBreadcrumbs.module.scss";
import { useRootDispatch } from "../../../../../stores";
import { getSelectedWorkflowName, getSubgraphBreadcrumbs } from "../../../../../stores/GraphStores/GraphCommon/selectors";
import { goBackInGraph } from "../../../../../stores/GraphStores/GraphCommon/actions";

const SubgraphBreadcrumbs = () => {
  const dispatch = useRootDispatch();
  const subgraphBreadcrumbs = useSelector(getSubgraphBreadcrumbs);
  const selectedWorkflowName = useSelector(getSelectedWorkflowName);

  return <div className={styles.breadcrumbsContainer}>
    {subgraphBreadcrumbs.length
      ? <button
          key={"reset"}
          className={styles.breadcrumbsButton}
          onClick={() => dispatch(goBackInGraph(0))}
        >
          {selectedWorkflowName}
        </button>
      : <></>}
    {subgraphBreadcrumbs.map((key, index) => <React.Fragment key={`${key}_${index}`}>
      <span className={styles.breadcrumbsSeparator}>→</span>
      <button
        className={styles.breadcrumbsButton}
        onClick={() => dispatch(goBackInGraph(index + 1))}
        disabled={index === subgraphBreadcrumbs.length - 1}
      >
        {key}
      </button>
    </React.Fragment>
    )}
  </div>;
};

export default SubgraphBreadcrumbs;
