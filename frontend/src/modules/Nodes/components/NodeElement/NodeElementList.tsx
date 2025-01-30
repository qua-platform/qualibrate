import React from "react";
import { NodeElement, NodeMap } from "./NodeElement";
// eslint-disable-next-line css-modules/no-unused-class
import styles from "../../NodesPage.module.scss";

interface INodeListProps {
  listOfNodes?: NodeMap;
}

export const NodeElementList: React.FC<INodeListProps> = ({ listOfNodes }) => {
  return (
    listOfNodes && (
      <div className={styles.listWrapper} data-testid="node-list-wrapper">
        {Object.entries(listOfNodes).map(([key, node]) => {
          return <NodeElement key={key} nodeKey={key} node={node} data-testid={`node-element-${key}`} />;
        })}
      </div>
    )
  );
};
