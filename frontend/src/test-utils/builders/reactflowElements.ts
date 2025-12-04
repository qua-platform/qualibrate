import { Node, Edge, MarkerType } from "@xyflow/react";

export const DEFAULT_NODE_TYPE = "DefaultNode";

/**
 * Creates a simple 3-node linear graph for basic testing.
 * Usage: Basic rendering, selection, and click tests
 */
export const createSimpleGraph = (): { nodes: Node[]; edges: Edge[] } => ({
  nodes: [
    {
      id: "node1",
      type: DEFAULT_NODE_TYPE,
      position: { x: 0, y: 0 },
      data: { label: "node1" },
    },
    {
      id: "node2",
      type: DEFAULT_NODE_TYPE,
      position: { x: 150, y: 0 },
      data: { label: "node2" },
    },
    {
      id: "node3",
      type: DEFAULT_NODE_TYPE,
      position: { x: 300, y: 0 },
      data: { label: "node3" },
    },
  ],
  edges: [
    {
      id: "edge1",
      source: "node1",
      target: "node2",
      markerEnd: { type: MarkerType.ArrowClosed },
    },
    {
      id: "edge2",
      source: "node2",
      target: "node3",
      markerEnd: { type: MarkerType.ArrowClosed },
    },
  ],
});

/**
 * Creates nodes with different status classes.
 * Usage: Testing status updates and CSS class application
 */
export const createGraphWithStatuses = (): {
  nodes: Node[];
  edges: Edge[];
} => ({
  nodes: [
    {
      id: "pending_node",
      type: DEFAULT_NODE_TYPE,
      position: { x: 0, y: 0 },
      data: { label: "Pending", status: "pending" },
      className: "pending",
    },
    {
      id: "running_node",
      type: DEFAULT_NODE_TYPE,
      position: { x: 150, y: 0 },
      data: { label: "Running", status: "running" },
      className: "running",
    },
    {
      id: "completed_node",
      type: DEFAULT_NODE_TYPE,
      position: { x: 300, y: 0 },
      data: { label: "Completed", status: "completed" },
      className: "completed",
    },
    {
      id: "failed_node",
      type: DEFAULT_NODE_TYPE,
      position: { x: 450, y: 0 },
      data: { label: "Failed", status: "failed" },
      className: "failed",
    },
  ],
  edges: [
    { id: "e1", source: "pending_node", target: "running_node" },
    { id: "e2", source: "running_node", target: "completed_node" },
    { id: "e3", source: "completed_node", target: "failed_node" },
  ],
});

/**
 * Creates a node with selection state.
 * Usage: Testing node selection and highlighting
 */
export const createGraphWithSelection = (
  selectedId: string,
): { nodes: Node[]; edges: Edge[] } => {
  const { nodes, edges } = createSimpleGraph();
  return {
    nodes: nodes.map((node) => ({
      ...node,
      selected: node.data.label === selectedId,
      className: node.data.label === selectedId ? "selected" : undefined,
    })),
    edges,
  };
};

/**
 * Creates a complex branching graph.
 * Usage: Testing layout algorithm and complex rendering
 */
export const createComplexGraph = (): { nodes: Node[]; edges: Edge[] } => ({
  nodes: [
    {
      id: "root",
      type: DEFAULT_NODE_TYPE,
      position: { x: 0, y: 100 },
      data: { label: "Root" },
    },
    {
      id: "a1",
      type: DEFAULT_NODE_TYPE,
      position: { x: 150, y: 0 },
      data: { label: "A1" },
    },
    {
      id: "a2",
      type: DEFAULT_NODE_TYPE,
      position: { x: 150, y: 100 },
      data: { label: "A2" },
    },
    {
      id: "a3",
      type: DEFAULT_NODE_TYPE,
      position: { x: 150, y: 200 },
      data: { label: "A3" },
    },
    {
      id: "b1",
      type: DEFAULT_NODE_TYPE,
      position: { x: 300, y: 50 },
      data: { label: "B1" },
    },
    {
      id: "b2",
      type: DEFAULT_NODE_TYPE,
      position: { x: 300, y: 150 },
      data: { label: "B2" },
    },
    {
      id: "merge",
      type: DEFAULT_NODE_TYPE,
      position: { x: 450, y: 100 },
      data: { label: "Merge" },
    },
  ],
  edges: [
    { id: "e1", source: "root", target: "a1" },
    { id: "e2", source: "root", target: "a2" },
    { id: "e3", source: "root", target: "a3" },
    { id: "e4", source: "a1", target: "b1" },
    { id: "e5", source: "a2", target: "b1" },
    { id: "e6", source: "a2", target: "b2" },
    { id: "e7", source: "a3", target: "b2" },
    { id: "e8", source: "b1", target: "merge" },
    { id: "e9", source: "b2", target: "merge" },
  ],
});

/**
 * Creates a large graph for performance testing.
 * Usage: Testing layout performance and rendering with many nodes
 */
export const createLargeGraph = (
  nodeCount: number = 50,
): { nodes: Node[]; edges: Edge[] } => {
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  // Create nodes in a grid pattern
  const nodesPerRow = Math.ceil(Math.sqrt(nodeCount));
  for (let i = 0; i < nodeCount; i++) {
    const row = Math.floor(i / nodesPerRow);
    const col = i % nodesPerRow;
    nodes.push({
      id: `node${i}`,
      type: DEFAULT_NODE_TYPE,
      position: { x: col * 150, y: row * 100 },
      data: { label: `Node ${i}` },
    });
  }

  // Create edges (each node connects to next node in sequence)
  for (let i = 0; i < nodeCount - 1; i++) {
    edges.push({
      id: `edge${i}`,
      source: `node${i}`,
      target: `node${i + 1}`,
    });
  }

  return { nodes, edges };
};

/**
 * Creates an empty graph.
 * Usage: Testing empty state rendering
 */
export const createEmptyGraph = (): { nodes: Node[]; edges: Edge[] } => ({
  nodes: [],
  edges: [],
});
