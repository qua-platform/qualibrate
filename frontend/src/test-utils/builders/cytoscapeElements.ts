/**
 * @fileoverview Test builders for Cytoscape element definitions.
 *
 * Provides helper functions to create Cytoscape node and edge definitions
 * for use in tests.
 */
import { ElementDefinition } from "cytoscape";

/**
 * Creates a Cytoscape node element definition.
 * Note: group parameter in Cytoscape elements is the element type (nodes/edges), not the node category.
 */
export const createCytoscapeNode = (id: string, classes?: string): ElementDefinition => ({
  group: "nodes",
  data: { id },
  classes,
});

/**
 * Creates a Cytoscape edge element definition.
 */
export const createCytoscapeEdge = (source: string, target: string): ElementDefinition => ({
  group: "edges",
  data: {
    id: `${source}-${target}`,
    source,
    target,
  },
});

/**
 * Creates a simple graph with connected nodes.
 */
export const createSimpleGraph = (): ElementDefinition[] => [
  createCytoscapeNode("node1"),
  createCytoscapeNode("node2"),
  createCytoscapeNode("node3"),
  createCytoscapeEdge("node1", "node2"),
  createCytoscapeEdge("node2", "node3"),
];

/**
 * Creates a graph with nodes in various status classes.
 */
export const createGraphWithStatuses = (): ElementDefinition[] => [
  createCytoscapeNode("running_node", "running"),
  createCytoscapeNode("completed_node", "completed"),
  createCytoscapeNode("failed_node", "failed"),
  createCytoscapeNode("pending_node", ""),
];
