import { Node, Edge, MarkerType } from "@xyflow/react";
import { FetchGraphResponse } from "../../../../src/stores/GraphStores/GraphLibrary";

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
      data: {
        condition: {
          label: "test-condition",
          content:
            "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
        }
      }
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

/**
 * Creates a graph with N nodes in linear sequence.
 * Usage: Performance testing, scalability tests
 */
export const createGraph = (
  nodeCount: number,
): { nodes: Node[]; edges: Edge[] } => {
  const nodes = Array.from({ length: nodeCount }, (_, i) => ({
    id: `node${i + 1}`,
    type: DEFAULT_NODE_TYPE,
    position: { x: i * 150, y: 0 },
    data: { label: `node${i + 1}` },
  }));

  const edges = Array.from({ length: nodeCount - 1 }, (_, i) => ({
    id: `edge${i + 1}`,
    source: `node${i + 1}`,
    target: `node${i + 2}`,
    markerEnd: { type: MarkerType.ArrowClosed },
  }));

  return { nodes, edges };
};

/**
 * Creates a diamond-shaped DAG (Directed Acyclic Graph).
 * Structure: start -> mid1, mid2 -> end
 * Usage: Testing complex layout algorithms, DAG handling
 */
export const createDiamondGraph = (): { nodes: Node[]; edges: Edge[] } => ({
  nodes: [
    {
      id: "start",
      type: DEFAULT_NODE_TYPE,
      position: { x: 0, y: 0 },
      data: { label: "start" },
    },
    {
      id: "mid1",
      type: DEFAULT_NODE_TYPE,
      position: { x: 0, y: 0 },
      data: { label: "mid1" },
    },
    {
      id: "mid2",
      type: DEFAULT_NODE_TYPE,
      position: { x: 0, y: 0 },
      data: { label: "mid2" },
    },
    {
      id: "end",
      type: DEFAULT_NODE_TYPE,
      position: { x: 0, y: 0 },
      data: { label: "end" },
    },
  ],
  edges: [
    { id: "e1", source: "start", target: "mid1" },
    { id: "e2", source: "start", target: "mid2" },
    { id: "e3", source: "mid1", target: "end" },
    { id: "e4", source: "mid2", target: "end" },
  ],
});

/**
 * Transforms ReactFlow graph data to API response format (FetchGraphResponse).
 * Usage: Mocking API responses in integration tests
 *
 * NOTE: IDs must be sequential integers starting from 0 for ELK to work properly.
 */
export const transformToApiFormat = ({
  nodes,
  edges,
}: {
  nodes: Node[];
  edges: Edge[];
}) => {
  // Create a mapping from string node IDs to sequential numeric IDs

  return {
    nodes: nodes.map((n) => {
      const data: { label: string; subgraph?: FetchGraphResponse } = {
        label: (n.data.label || n.id) as string,
      };
      if (n.data.subgraph) {
        data.subgraph = n.data.subgraph as FetchGraphResponse;
      }
      return {
        name: n.id,
        data,
        position: n.position,
        loop: false,
        selected: n.selected
      };
    }),
    edges: edges.map((e) => ({
      id: e.id,
      source: e.source ?? nodes[0].id,
      target: e.target ?? nodes[1].id,
      data: e.data,
      position: { x: 0, y: 0 },
    })),
  };
};
