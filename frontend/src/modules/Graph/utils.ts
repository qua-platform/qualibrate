import { Node } from "@xyflow/react";
import ELK from "elkjs/lib/elk.bundled.js";
import { EdgeDTO, FetchGraphResponse } from "../../stores/GraphStores/GraphLibrary";
import { CONDITIONAL_EDGE_TYPE, DEFAULT_NODE_TYPE, LOOPING_EDGE_TYPE } from "./components";

const elk = new ELK();
const spacingBetweenLayers = "100";
const spacingBetweenNodes = "80";
const layoutOptions = {
  "elk.algorithm": "layered",
  "elk.layered.spacing.nodeNodeBetweenLayers": spacingBetweenLayers,
  "elk.spacing.nodeNode": spacingBetweenNodes,
  "elk.direction": "RIGHT",
  "elk.layered.wrapping.strategy": "SINGLE_EDGE",
};

export const getLayoutedElements = ({ nodes = [], edges = [] }: FetchGraphResponse) => {
  const loopingEdges: EdgeDTO[] = [];

  const children = nodes.map((node) => ({
    ...node,
    id: node.name,
    targetPosition: "left",
    sourcePosition: "right",
    // Hardcode a width and height for elk to use when layouting.
    width: 70,
    height: 70,
  }));

  const graph = {
    id: "root",
    layoutOptions,
    children,
    edges: [...edges, ...loopingEdges].map((edge) => {
      const loopEdgeType = (edge.data && "loop" in edge.data) ? LOOPING_EDGE_TYPE : undefined;
      const conditionalEdgeType = edge.data?.condition?.label ? CONDITIONAL_EDGE_TYPE : undefined;
      const typeOfAnEdge = loopEdgeType ?? conditionalEdgeType ?? undefined;
      return {
        ...edge,
        id: String(edge.id),
        source: String(edge.source),
        target: String(edge.target),
        sources: [String(edge.source)],
        targets: [String(edge.target)],
        type: typeOfAnEdge,
      };
    }),
  };

  return elk
    .layout(graph)
    .then((layoutedGraph) => ({
      nodes:
        (layoutedGraph.children?.map((node) => ({
          ...node,
          type: DEFAULT_NODE_TYPE,
          // React Flow expects a position property on the node instead of `x` and `y` fields.
          position: { x: node.x, y: node.y },
        })) as Node[]) || [],

      edges: layoutedGraph.edges,
    }))
    .catch(console.error);
};
