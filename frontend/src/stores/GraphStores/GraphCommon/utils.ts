import { DEFAULT_NODE_TYPE } from "../../../modules/GraphLibrary/components/Graph/Graph";
import { Edge, Node } from "@xyflow/react";
import ELK from "elkjs/lib/elk.bundled.js";

const elk = new ELK();
const spacingBetweenLayers = "100";
const spacingBetweenNodes = "80";
const layoutOptions = {
  "elk.algorithm": "layered",
  "elk.layered.spacing.nodeNodeBetweenLayers": spacingBetweenLayers,
  "elk.spacing.nodeNode": spacingBetweenNodes,
  "elk.direction": "RIGHT",
  "elk.layered.wrapping.strategy": "SINGLE_EDGE"
};

export const getLayoutedElements = (nodes: Node[], edges: Edge[]) => {
  const graph = {
    id: "root",
    layoutOptions,
    children: nodes.map((node) => ({
      ...node,
      targetPosition: "left",
      sourcePosition: "right",

      // Hardcode a width and height for elk to use when layouting.
      width: 50,
      height: 70,
    })),
    edges: edges.map(edge => ({
      ...edge,
      sources: [ edge.source ],
      targets: [ edge.target ],
    })),
  };

  return elk
    .layout(graph)
    .then((layoutedGraph) => ({
      nodes: layoutedGraph.children?.map((node) => ({
        ...node,
        type: DEFAULT_NODE_TYPE,
        // React Flow expects a position property on the node instead of `x` and `y` fields.
        position: { x: node.x, y: node.y },
      })) as Node[] || [],

      edges: layoutedGraph.edges
    }))
    .catch(console.error);
};