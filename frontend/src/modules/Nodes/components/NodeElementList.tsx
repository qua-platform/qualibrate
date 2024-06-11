import React from "react";
import { NodeDTO, NodeElement } from "./NodeElement";

interface INodeListProps {
  listOfNodes: NodeDTO[];
}

export const NodeElementList: React.FC<INodeListProps> = ({ listOfNodes }) => {
  return listOfNodes.map((node, index) => <NodeElement key={node.name} node={node} nodeIndex={index} />);
};
