import React from "react";
import { Handle, NodeProps, Position } from "@xyflow/react";
import { classNames } from "../../../../utils/classnames";
import styles from "./DefaultNode.module.scss";
import { NodeWithData } from "../../../../stores/GraphStores/GraphLibrary";

const DefaultNode = (props: NodeProps<NodeWithData>) => {
  return (
    <div className={classNames(styles.defaultNode, props.selected && styles.selected, !!props.data.subgraph && styles.subgraph)} data-id={props.data.label}>
      <label className={styles.defaultNodeLabel}>{props.data.label}</label>
      <Handle className={styles.defaultNodeHandle} type="target" position={Position.Left} />
      <Handle className={styles.defaultNodeHandle} type="source" position={Position.Right} />
    </div>
  );
};

export default DefaultNode;
