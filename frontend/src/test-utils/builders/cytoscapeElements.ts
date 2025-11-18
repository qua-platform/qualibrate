/**
 * @fileoverview Test builders for Cytoscape element definitions.
 *
 * Provides helper functions to create Cytoscape node and edge definitions
 * for use in tests.
 */
import { Edge, Node } from "@xyflow/react";

/**
 * Creates a graph node element definition.
 */
const createNode = (id: string, classes?: string): Node => ({
  id,
  data: {
    classes
  },
  position: { x: 100, y: 100 }
});

/**
 * Creates a graph edge element definition.
 */
const createEdge = (source: string, target: string): Edge => ({
  id: `${source}-${target}`,
  source,
  target,
  data: { },
});

export const createGraphOfOneNode = () => ({
  nodes: [ createNode("node1") ]
});

/**
 * Creates a simple graph with connected nodes.
 */
export const createSimpleGraph = (): { nodes: Node[], edges: Edge[] } => ({
  nodes: [
    createNode("node1"),
    createNode("node2"),
    createNode("node3"),
  ],
  edges: [
    createEdge("node1", "node2"),
    createEdge("node2", "node3"),
  ]
});

/**
 * Creates a big graph of 200 nodes with random connections
 */
export const createRandomBigGraph = (): { nodes: Node[], edges: Edge[] } => {
  return {
    nodes: Array.from({length: 200}, (_, index) => createNode("node" + index)),
    edges: Array.from({length: 199}, (_, index) =>
      createEdge("node" + index, "node" + (Math.ceil(199 * Math.random())))
    )
  };
};

/**
 * Creates graph of 50 nodes with predefined connections
 */
export const createBigGraph = (): { nodes: Node[], edges: Edge[] } => {
  const getEdge = (index: number) => {
    if (index === 10 || index === 19)
      return 20;
    if (index === 20 || index === 29)
      return 49;
    if (index === 39 || index === 35)
      return 40;
    return index + 1;
  };

  const nodes = Array.from({length: 50}, (_, index) => {
    return createNode("node"+index);
  });
  const edges = Array.from({length: 49}, (_, index) => {
    return createEdge("node"+index, "node"+(getEdge(index)));
  });
  return { nodes, edges };
};

/**
 * Creates a graph with nodes in various status classes.
 */
export const createGraphWithStatuses = () => [
  createNode("running_node", "running"),
  createNode("completed_node", "completed"),
  createNode("failed_node", "failed"),
  createNode("pending_node", ""),
];
