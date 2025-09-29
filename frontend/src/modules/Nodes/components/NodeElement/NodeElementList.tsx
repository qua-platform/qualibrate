import React from "react";
import { NodeElement } from "./NodeElement";
// eslint-disable-next-line css-modules/no-unused-class
import styles from "../../NodesPage.module.scss";
import { useNodesContext } from "../../context/NodesContext";
import LoaderPage from "../../../../ui-lib/loader/LoaderPage";

export const NodeElementList: React.FC = () => {
  const { allNodes, isRescanningNodes } = useNodesContext();

  if (isRescanningNodes) {
    return <LoaderPage />;
  }

  return (
    allNodes && (
      <div className={styles.listWrapper} data-testid="node-list-wrapper">
        {Object.entries(allNodes).map(([key, node]) => {
          return <NodeElement key={key} nodeKey={key} node={node} data-testid={`node-element-${key}`} />;
        })}
      </div>
    )
  );
};
