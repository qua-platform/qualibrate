import React from "react";
import { Handle, NodeProps, Position } from "@xyflow/react";
import { NodeWithData } from "../../../../../stores/GraphStores/GraphCommon/GraphCommonStore";
import { classNames } from "../../../../../utils/classnames";
// eslint-disable-next-line css-modules/no-unused-class
import styles from "./styles.module.scss";

const DefaultNode = (props: NodeProps<NodeWithData>) => {
  return (
    <div className={classNames(styles.defaultNode, props.selected && styles.selected, !!props.data.subgraph && styles.subgraph)}>
      <label className={styles.defaultNodeLabel}>{props.data.label}</label>
      <Handle className={styles.defaultNodeHandle} type="target" position={Position.Left} />
      <Handle className={styles.defaultNodeHandle} type="source" position={Position.Right} />
    </div>
  );
};

export default DefaultNode;
