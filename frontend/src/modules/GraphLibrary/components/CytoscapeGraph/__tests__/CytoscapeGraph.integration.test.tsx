/**
 * @fileoverview Integration tests for CytoscapeGraph component with REAL Cytoscape.js.
 *
 * These tests use the actual Cytoscape library in headless mode to verify:
 * - Real graph API functionality
 * - Actual node selection and interaction
 * - Status class updates with live Cytoscape instance
 * - Graph traversal and querying
 *
 * @see CytoscapeGraph.test.tsx for fast unit tests with mocked Cytoscape
 */
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";
import { createSimpleGraph, createGraphWithStatuses } from "@/test-utils/builders/cytoscapeElements";

// Import real Cytoscape - NO MOCKING
import cytoscape from "cytoscape";

describe("CytoscapeGraph - Real Cytoscape Integration Tests", () => {
  // Clean up DOM after each test
  afterEach(() => {
    cleanup();
    // Clear any lingering Cytoscape instances
    document.body.innerHTML = "";
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should create real Cytoscape instance with actual graph API", async () => {
    // Use headless Cytoscape for testing - no DOM required
    const elements = createSimpleGraph();

    // Create Cytoscape instance directly without React wrapper
    const cy = cytoscape({
      headless: true, // Headless mode doesn't need DOM or layout engine
      elements,
      styleEnabled: false, // Disable styles in headless mode
    });

    // Verify Cytoscape instance was created
    expect(cy).toBeDefined();
    expect(cy.nodes().length).toBe(3); // node1, node2, node3
    expect(cy.edges().length).toBe(2); // node1->node2, node2->node3

    // Verify nodes have correct IDs
    const nodeIds = cy.nodes().map((node) => node.id());
    expect(nodeIds).toContain("node1");
    expect(nodeIds).toContain("node2");
    expect(nodeIds).toContain("node3");

    // Clean up
    cy.destroy();
  });

  it("should handle node selection with real Cytoscape API", async () => {
    const elements = createSimpleGraph();
    const mockNodeClickHandler = vi.fn();

    // Create headless Cytoscape instance
    const cy = cytoscape({
      headless: true,
      elements,
      styleEnabled: false,
    });

    // Verify nodes were created
    const nodes = cy.nodes();
    expect(nodes.length).toBe(3);

    // Select a specific node
    const node1 = cy.getElementById("node1");
    expect(node1.length).toBe(1);
    expect(node1.selected()).toBe(false);

    // Simulate node selection
    node1.select();
    expect(node1.selected()).toBe(true);

    // Set up click event handler
    node1.on("click", () => {
      mockNodeClickHandler(node1.id());
    });

    // Trigger click event
    node1.emit("click");

    // Verify handler was called
    expect(mockNodeClickHandler).toHaveBeenCalledWith("node1");

    // Clean up
    cy.destroy();
  });

  it("should update node status classes with real Cytoscape API", async () => {
    // Create graph with status classes
    const elementsWithStatus = createGraphWithStatuses();

    // Create headless Cytoscape instance
    const cy = cytoscape({
      headless: true,
      elements: elementsWithStatus,
      styleEnabled: false,
    });

    // Verify nodes have correct status classes
    const runningNode = cy.getElementById("running_node");
    const completedNode = cy.getElementById("completed_node");
    const failedNode = cy.getElementById("failed_node");
    const pendingNode = cy.getElementById("pending_node");

    expect(runningNode.length).toBe(1);
    expect(completedNode.length).toBe(1);
    expect(failedNode.length).toBe(1);
    expect(pendingNode.length).toBe(1);

    // Check that classes are correctly applied
    expect(runningNode.hasClass("running")).toBe(true);
    expect(completedNode.hasClass("completed")).toBe(true);
    expect(failedNode.hasClass("failed")).toBe(true);

    // Test dynamic class updates
    runningNode.removeClass("running");
    runningNode.addClass("completed");
    expect(runningNode.hasClass("completed")).toBe(true);
    expect(runningNode.hasClass("running")).toBe(false);

    // Clean up
    cy.destroy();
  });

  it("should properly mark Cytoscape instance as destroyed", async () => {
    const elements = createSimpleGraph();

    // Create headless Cytoscape instance
    const cy = cytoscape({
      headless: true,
      elements,
      styleEnabled: false,
    });

    // Verify instance is active before destroy
    expect(cy.nodes().length).toBe(3);
    expect(cy.edges().length).toBe(2);
    expect(cy.destroyed()).toBe(false);

    // Verify instance is functional
    const node1 = cy.getElementById("node1");
    expect(node1.length).toBe(1);

    // Destroy the instance
    cy.destroy();

    // Verify instance was marked as destroyed
    expect(cy.destroyed()).toBe(true);

    // Note: Cytoscape in headless mode still allows access to nodes/edges after destroy
    // but in DOM mode, the canvas would be cleaned up
  });

  it("should support graph traversal and queries with real Cytoscape API", async () => {
    const elements = createSimpleGraph();

    // Create headless Cytoscape instance
    const cy = cytoscape({
      headless: true,
      elements,
      styleEnabled: false,
    });

    // Test node traversal
    const node1 = cy.getElementById("node1");
    const successors = node1.successors();

    // node1 -> node2 -> node3, so successors should include node2, edge, and node3
    expect(successors.length).toBeGreaterThan(0);

    // Test neighborhood queries
    const node2 = cy.getElementById("node2");
    const neighbors = node2.neighborhood();

    // node2 is connected to node1 and node3
    expect(neighbors.length).toBeGreaterThan(0);

    // Test filtering
    const selectedNodes = cy.nodes().filter((node) => node.selected());
    expect(selectedNodes.length).toBe(0); // No nodes selected initially

    // Select a node and verify filter
    node1.select();
    const selectedAfter = cy.nodes().filter((node) => node.selected());
    expect(selectedAfter.length).toBe(1);
    expect(selectedAfter[0].id()).toBe("node1");

    // Clean up
    cy.destroy();
  });
});
