import { describe, it, expect } from "vitest";
import {
  createSimpleGraph,
  createGraphWithStatuses,
  createGraphWithSelection,
  createComplexGraph,
  createLargeGraph,
  createEmptyGraph,
  DEFAULT_NODE_TYPE,
} from "../reactflowElements";

describe("ReactFlow Element Builders", () => {
  describe("createSimpleGraph", () => {
    it("should create simple graph with 3 nodes and 2 edges", () => {
      const { nodes, edges } = createSimpleGraph();

      expect(nodes).toHaveLength(3);
      expect(edges).toHaveLength(2);
    });

    it("should create nodes with correct IDs and positions", () => {
      const { nodes } = createSimpleGraph();

      expect(nodes[0].id).toBe("node1");
      expect(nodes[0].position).toEqual({ x: 0, y: 0 });
      expect(nodes[1].id).toBe("node2");
      expect(nodes[1].position).toEqual({ x: 150, y: 0 });
      expect(nodes[2].id).toBe("node3");
      expect(nodes[2].position).toEqual({ x: 300, y: 0 });
    });

    it("should create nodes with labels", () => {
      const { nodes } = createSimpleGraph();

      expect(nodes[0].data.label).toBe("node1");
      expect(nodes[1].data.label).toBe("node2");
      expect(nodes[2].data.label).toBe("node3");
    });

    it("should create edges with correct source and target", () => {
      const { edges } = createSimpleGraph();

      expect(edges[0].source).toBe("node1");
      expect(edges[0].target).toBe("node2");
      expect(edges[1].source).toBe("node2");
      expect(edges[1].target).toBe("node3");
    });

    it("should use default node type", () => {
      const { nodes } = createSimpleGraph();

      nodes.forEach((node) => {
        expect(node.type).toBe(DEFAULT_NODE_TYPE);
      });
    });
  });

  describe("createGraphWithStatuses", () => {
    it("should create graph with 4 nodes of different statuses", () => {
      const { nodes } = createGraphWithStatuses();

      expect(nodes).toHaveLength(4);
    });

    it("should apply correct status classes", () => {
      const { nodes } = createGraphWithStatuses();

      const pendingNode = nodes.find((n) => n.id === "pending_node");
      const runningNode = nodes.find((n) => n.id === "running_node");
      const completedNode = nodes.find((n) => n.id === "completed_node");
      const failedNode = nodes.find((n) => n.id === "failed_node");

      expect(pendingNode?.className).toBe("pending");
      expect(runningNode?.className).toBe("running");
      expect(completedNode?.className).toBe("completed");
      expect(failedNode?.className).toBe("failed");
    });

    it("should include status in node data", () => {
      const { nodes } = createGraphWithStatuses();

      const runningNode = nodes.find((n) => n.id === "running_node");
      expect(runningNode?.data.status).toBe("running");
    });

    it("should create edges between status nodes", () => {
      const { edges } = createGraphWithStatuses();

      expect(edges).toHaveLength(3);
      expect(edges[0].source).toBe("pending_node");
      expect(edges[0].target).toBe("running_node");
    });
  });

  describe("createGraphWithSelection", () => {
    it("should create graph with selected node", () => {
      const { nodes } = createGraphWithSelection("node2");

      const selectedNode = nodes.find((n) => n.id === "node2");
      expect(selectedNode?.selected).toBe(true);
    });

    it("should mark only the specified node as selected", () => {
      const { nodes } = createGraphWithSelection("node2");

      expect(nodes.find((n) => n.id === "node1")?.selected).toBeFalsy();
      expect(nodes.find((n) => n.id === "node2")?.selected).toBe(true);
      expect(nodes.find((n) => n.id === "node3")?.selected).toBeFalsy();
    });

    it("should apply selected className to selected node", () => {
      const { nodes } = createGraphWithSelection("node2");

      const selectedNode = nodes.find((n) => n.id === "node2");
      expect(selectedNode?.className).toBe("selected");
    });

    it("should not apply selected className to non-selected nodes", () => {
      const { nodes } = createGraphWithSelection("node2");

      expect(nodes.find((n) => n.id === "node1")?.className).toBeUndefined();
      expect(nodes.find((n) => n.id === "node3")?.className).toBeUndefined();
    });

    it("should maintain edges from simple graph", () => {
      const { edges } = createGraphWithSelection("node1");

      expect(edges).toHaveLength(2);
    });
  });

  describe("createComplexGraph", () => {
    it("should create complex graph with 7 nodes", () => {
      const { nodes } = createComplexGraph();

      expect(nodes).toHaveLength(7);
    });

    it("should create complex graph with 9 edges", () => {
      const { edges } = createComplexGraph();

      expect(edges).toHaveLength(9);
    });

    it("should have root node", () => {
      const { nodes } = createComplexGraph();

      const rootNode = nodes.find((n) => n.id === "root");
      expect(rootNode).toBeDefined();
      expect(rootNode?.data.label).toBe("Root");
    });

    it("should have merge node", () => {
      const { nodes } = createComplexGraph();

      const mergeNode = nodes.find((n) => n.id === "merge");
      expect(mergeNode).toBeDefined();
      expect(mergeNode?.data.label).toBe("Merge");
    });

    it("should create branching structure", () => {
      const { edges } = createComplexGraph();

      // Root should have 3 outgoing edges
      const rootEdges = edges.filter((e) => e.source === "root");
      expect(rootEdges).toHaveLength(3);
    });
  });

  describe("createLargeGraph", () => {
    it("should create graph with default 50 nodes", () => {
      const { nodes } = createLargeGraph();

      expect(nodes).toHaveLength(50);
    });

    it("should create graph with custom node count", () => {
      const { nodes } = createLargeGraph(100);

      expect(nodes).toHaveLength(100);
    });

    it("should create N-1 edges for N nodes", () => {
      const { edges } = createLargeGraph(50);

      expect(edges).toHaveLength(49);
    });

    it("should position nodes in grid pattern", () => {
      const { nodes } = createLargeGraph(9);

      // With 9 nodes, should be 3x3 grid
      const positions = nodes.map((n) => n.position);

      // First row
      expect(positions[0]).toEqual({ x: 0, y: 0 });
      expect(positions[1]).toEqual({ x: 150, y: 0 });
      expect(positions[2]).toEqual({ x: 300, y: 0 });

      // Second row
      expect(positions[3]).toEqual({ x: 0, y: 100 });
    });

    it("should create sequential edges", () => {
      const { edges } = createLargeGraph(10);

      expect(edges[0].source).toBe("node0");
      expect(edges[0].target).toBe("node1");
      expect(edges[8].source).toBe("node8");
      expect(edges[8].target).toBe("node9");
    });

    it("should label nodes with node index", () => {
      const { nodes } = createLargeGraph(5);

      expect(nodes[0].data.label).toBe("Node 0");
      expect(nodes[4].data.label).toBe("Node 4");
    });
  });

  describe("createEmptyGraph", () => {
    it("should create graph with no nodes", () => {
      const { nodes } = createEmptyGraph();

      expect(nodes).toHaveLength(0);
    });

    it("should create graph with no edges", () => {
      const { edges } = createEmptyGraph();

      expect(edges).toHaveLength(0);
    });

    it("should return empty arrays", () => {
      const { nodes, edges } = createEmptyGraph();

      expect(Array.isArray(nodes)).toBe(true);
      expect(Array.isArray(edges)).toBe(true);
    });
  });
});
