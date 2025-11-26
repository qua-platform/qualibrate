import { FetchGraphResponse } from "@/modules/GraphLibrary/api/GraphLibraryApi";
import { DEFAULT_NODE_TYPE } from "../../../modules/GraphLibrary/components/Graph/Graph";
import { Node } from "@xyflow/react";
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

export const getLayoutedElements = ({ nodes, edges }: FetchGraphResponse) => {
  const graph = {
    id: "root",
    layoutOptions,
    children: nodes.map((node) => ({
      ...node,
      id: String(node.id),
      targetPosition: "left",
      sourcePosition: "right",

      // Hardcode a width and height for elk to use when layouting.
      width: 50,
      height: 70,
    })),
    edges: edges.map(edge => ({
      ...edge,
      id: String(edge.id),
      source: String(edge.source),
      target: String(edge.target),
      sources: [ String(edge.source) ],
      targets: [ String(edge.target) ],
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