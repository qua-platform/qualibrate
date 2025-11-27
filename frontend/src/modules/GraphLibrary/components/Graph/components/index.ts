import { MarkerType } from "@xyflow/react";
import DefaultNode from "./DefaultNode";
import LoopingEdge from "./LoopingEdge";

export const DEFAULT_NODE_TYPE = "DefaultNode";
export const LOOPING_EDGE_TYPE = "LoopingNode";

const edgeColor = "#40464d";
export const edgeOptions = {
  markerEnd: {
    type: MarkerType.ArrowClosed,
    width: 60,
    height: 8,
    color: edgeColor,
  },
  style: {
    strokeWidth: 2,
    stroke: edgeColor,
  },
  selectable: false,
};

export default {
  nodeTypes: {
    [DEFAULT_NODE_TYPE]: DefaultNode,
  },
  edgeTypes: {
    [LOOPING_EDGE_TYPE]: LoopingEdge
  },
};
