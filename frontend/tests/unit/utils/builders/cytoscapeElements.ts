/**
 * @fileoverview Test builders for Cytoscape element definitions.
 *
 * Provides helper functions to create Cytoscape node and edge definitions
 * for use in tests.
 */
import {Edge, Node} from "@xyflow/react";
import {NodeData} from "../../../../src/stores/GraphStores/GraphLibrary";

/**
 * Creates a graph node element definition.
 */
const createNode = (id: string, subgraph?: { nodes: Node<NodeData>[]; edges: Edge[] }): Node<NodeData> => ({
  id,
  data: {
    label: id,
    subgraph,
  },
  position: { x: 100, y: 100 },
});

/**
 * Creates a graph edge element definition.
 */
const createEdge = (source: string, target: string, condition?: boolean): Edge => ({
  id: `${source}-${target}`,
  source,
  target,
  data: { condition: condition },
});

export const createGraphOfOneNode = () => ({
  nodes: [createNode("node1")],
});

/**
 * Creates a simple graph with connected nodes.
 */
export const createSimpleGraph = (prefix: string = ""): { nodes: Node<NodeData>[], edges: Edge[] } => ({
  nodes: [createNode(`${prefix}_node1`), createNode(`${prefix}_node2`), createNode(`${prefix}_node3`)],
  edges: [createEdge(`${prefix}_node1`, `${prefix}_node2`), createEdge(`${prefix}_node2`, `${prefix}_node3`)],
});

/**
 * Creates a simple graph with connected nodes and nodes that contains nested graphs.
 */
export const createSimpleNestedGraph = (): { nodes: Node[]; edges: Edge[] } => ({
  nodes: [
    createNode("node1"),
    createNode("node2", {
      nodes: [
        createNode("subgraph1_node1", createSimpleGraph("subgraph2")),
        createNode("subgraph1_node2"),
        createNode("subgraph1_node3", createSimpleGraph("subgraph3")),
      ],
      edges: [createEdge("subgraph1_node1", "subgraph1_node2"), createEdge("subgraph1_node2", "subgraph1_node3")],
    }),
    createNode("node3"),
  ],
  edges: [
    createEdge("node1", "node2", true), // this edge will have green color because (success)
    createEdge("node2", "node3", false), // this edge will have red color because (failure)
  ],
});

/**
 * Creates a big graph of 200 nodes with random connections
 */
export const createRandomBigGraph = (): { nodes: Node[]; edges: Edge[] } => {
  return {
    nodes: Array.from({ length: 200 }, (_, index) => createNode("node" + index)),
    edges: Array.from({ length: 199 }, (_, index) => createEdge("node" + index, "node" + Math.ceil(199 * Math.random()))),
  };
};

/**
 * Creates graph of 50 nodes with predefined connections
 */
export const createBigGraph = (): { nodes: Node[]; edges: Edge[] } => {
  const getEdge = (index: number) => {
    if (index === 10 || index === 19) return 20;
    if (index === 20 || index === 29) return 49;
    if (index === 39 || index === 35) return 40;
    return index + 1;
  };

  const nodes = Array.from({ length: 50 }, (_, index) => {
    return createNode("node" + index);
  });
  const edges = Array.from({ length: 49 }, (_, index) => {
    return createEdge("node" + index, "node" + getEdge(index));
  });
  return { nodes, edges };
};

/**
 * Creates a graph with nodes in various status classes.
 */
export const createGraphWithStatuses = () => [
  createNode("running_node"),
  createNode("completed_node"),
  createNode("failed_node"),
  createNode("pending_node"),
];
