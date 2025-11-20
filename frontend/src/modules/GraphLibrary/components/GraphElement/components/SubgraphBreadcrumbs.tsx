import React from "react";
import { useSelector } from "react-redux";
import styles from "./SubgraphBreadcrumbs.module.scss";
import BlueButton from "../../../../../ui-lib/components/Button/BlueButton";
import { useRootDispatch } from "../../../../../stores";
import { getSubgraphBreadcrumbs } from "../../../../../stores/GraphStores/GraphCommon/selectors";
import { goBackInGraph } from "../../../../../stores/GraphStores/GraphCommon/actions";

const SubgraphBreadcrumbs = () => {
  const dispatch = useRootDispatch();
  const subgraphBreadcrumbs = useSelector(getSubgraphBreadcrumbs);

  return <div className={styles.pathContainer}>
    {subgraphBreadcrumbs.length
      ? <BlueButton
          key={"reset"}
          onClick={() => dispatch(goBackInGraph(0))}
        >
          {"<"}
        </BlueButton>
      : <></>}
    {subgraphBreadcrumbs.map((key, index) =>
      <BlueButton
        key={key}
        onClick={() => dispatch(goBackInGraph(index + 1))}
        disabled={index === subgraphBreadcrumbs.length-1}
      >
        {key}
      </BlueButton>
    )}
  </div>;
};

export default SubgraphBreadcrumbs;
