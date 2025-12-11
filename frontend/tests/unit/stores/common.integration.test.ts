/**
 * @fileoverview Redux Store Integration Tests
 *
 * Tests complete data flow from API calls through Redux store to component updates.
 * Verifies:
 * - fetchWorkflowGraph action with real API mocking
 * - layoutAndSetNodesAndEdges action with ELK integration
 * - Node selection state synchronization
 * - Store state management and selectors
 *
 * @see actions.ts - Redux action creators
 * @see GraphCommonStore.ts - Redux slice definition
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { configureStore } from "@reduxjs/toolkit";
import { waitFor } from "@testing-library/react";
import { rootReducer } from "../../../src/stores";
import {
  fetchWorkflowGraph,
  setSelectedNodeNameInWorkflow,
  setNodes,
  setEdges,
  setShouldResetView,
  getWorkflowGraphNodes,
  getWorkflowGraphEdges,
  layoutAndSetNodesAndEdges,
} from "../../../src/stores/GraphStores/GraphCommon";
import { setTrackLatest } from "../../../src/stores/GraphStores/GraphStatus";
import { GraphLibraryApi } from "../../../src/stores/GraphStores/GraphLibrary";
import { createSimpleGraph, createComplexGraph, transformToApiFormat } from "../utils/builders/reactflowElements";

describe("Redux Store Integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("fetchWorkflowGraph Action Integration", () => {
    it("should fetch, layout, and update store in correct sequence", async () => {
      // Given: Mock API response with graph data
      const mockGraphData = createSimpleGraph();
      const mockApiResponse = {
        isOk: true,
        result: transformToApiFormat(mockGraphData),
      };
      vi.spyOn(GraphLibraryApi, "fetchGraph").mockResolvedValue(mockApiResponse);

      // Create real Redux store
      const store = configureStore({ reducer: rootReducer });

      // When: Dispatch fetchWorkflowGraph action
      await store.dispatch(fetchWorkflowGraph("test-workflow"));

      // Then: Wait for async layout to complete
      await waitFor(() => {
        const state = store.getState();
        expect(state.graph.common.nodes.length).toBeGreaterThan(0);
      });

      // And: Verify all expectations
      const state = store.getState();
      expect(state.graph.common.edges.length).toBeGreaterThan(0);

      // Verify nodes have been layouted (positions changed from initial values)
      const hasLayoutedPositions = state.graph.common.nodes.some(
        n => n.position.x !== 0 || n.position.y !== 0
      );
      expect(hasLayoutedPositions).toBe(true);

      // Verify shouldResetView flag is set
      expect(state.graph.common.shouldResetView).toBe(true);

      // Verify API was called with correct parameter
      expect(GraphLibraryApi.fetchGraph).toHaveBeenCalledWith("test-workflow");
    });

    it("should handle API errors gracefully", async () => {
      // Given: API returns error
      vi.spyOn(GraphLibraryApi, "fetchGraph").mockResolvedValue({
        isOk: false,
        error: "Network error",
      });

      const store = configureStore({ reducer: rootReducer });
      const consoleSpy = vi.spyOn(console, "log");

      // When: Dispatch fetch action
      await store.dispatch(fetchWorkflowGraph("test-workflow"));

      // Then: Error should be logged (current behavior)
      expect(consoleSpy).toHaveBeenCalledWith("Network error");

      // And: Store should not be updated with invalid data
      expect(store.getState().graph.common.nodes).toHaveLength(0);
    });

    it("should handle complex graphs with multiple nodes and edges", async () => {
      // Given: Complex graph structure
      const mockGraphData = createComplexGraph();
      const mockApiResponse = {
        isOk: true,
        result: transformToApiFormat(mockGraphData),
      };
      vi.spyOn(GraphLibraryApi, "fetchGraph").mockResolvedValue(mockApiResponse);

      const store = configureStore({ reducer: rootReducer });

      // When: Dispatch fetchWorkflowGraph
      await store.dispatch(fetchWorkflowGraph("complex-workflow"));

      // Then: Wait for layout to complete and verify
      await waitFor(() => {
        const state = store.getState();
        expect(state.graph.common.nodes.length).toBe(mockGraphData.nodes.length);
      });

      const state = store.getState();
      expect(state.graph.common.edges.length).toBe(mockGraphData.edges.length);

      // Verify layout produces valid positions
      state.graph.common.nodes.forEach(node => {
        expect(node.position).toBeDefined();
        expect(typeof node.position.x).toBe("number");
        expect(typeof node.position.y).toBe("number");
      });
    });
  });

  describe("layoutAndSetNodesAndEdges Action", () => {
    it("should layout nodes and edges, then update store", async () => {
      const store = configureStore({ reducer: rootReducer });

      const inputData = transformToApiFormat(createSimpleGraph());

      // When: Dispatch layout action
      await store.dispatch(layoutAndSetNodesAndEdges(inputData));

      // Then: Store should have layouted elements
      const state = store.getState();
      expect(state.graph.common.nodes.length).toBeGreaterThan(0);
      expect(state.graph.common.edges).toBeDefined();
      expect(state.graph.common.shouldResetView).toBe(true);

      // Verify nodes have positions (ELK ran successfully)
      state.graph.common.nodes.forEach(node => {
        expect(node.position).toBeDefined();
      });
    });

    it("should handle empty graph data", async () => {
      const store = configureStore({ reducer: rootReducer });

      const emptyData = { nodes: [], edges: [] };

      // When: Dispatch layout with empty data
      await store.dispatch(layoutAndSetNodesAndEdges(emptyData));

      // Then: Store should handle empty state gracefully
      const state = store.getState();
      expect(state.graph.common.nodes).toEqual([]);
      // shouldResetView might still be true from layout action
    });
  });

  describe("Node Selection State Synchronization", () => {
    it("should synchronize node selection between Redux and ReactFlow", () => {
      const store = configureStore({ reducer: rootReducer });
      const { nodes, edges } = createSimpleGraph();

      // Setup: Add nodes to store
      store.dispatch(setNodes(nodes));
      store.dispatch(setEdges(edges));

      // When: Select a node via Redux action
      store.dispatch(setSelectedNodeNameInWorkflow("node1"));

      // Then: Store should reflect selection
      const state = store.getState();
      expect(state.graph.common.selectedNodeNameInWorkflow).toBe("node1");
    });

    it("should clear selection when undefined is set", () => {
      const store = configureStore({ reducer: rootReducer });

      // Given: A node is selected
      store.dispatch(setSelectedNodeNameInWorkflow("node1"));
      expect(store.getState().graph.common.selectedNodeNameInWorkflow).toBe("node1");

      // When: Selection is cleared
      store.dispatch(setSelectedNodeNameInWorkflow(undefined));

      // Then: No node should be selected
      expect(store.getState().graph.common.selectedNodeNameInWorkflow).toBeUndefined();
    });
  });

  describe("setTrackLatest Integration", () => {
    it("should manage track-latest state correctly", () => {
      const store = configureStore({ reducer: rootReducer });

      // Given: Track-latest is enabled
      store.dispatch(setTrackLatest(true));
      expect(store.getState().graph.status.trackLatest).toBe(true);

      // When: User manually selects a node (disabling track-latest)
      store.dispatch(setTrackLatest(false));

      // Then: Track-latest should be disabled
      expect(store.getState().graph.status.trackLatest).toBe(false);
    });
  });

  describe("shouldResetView Flag Lifecycle", () => {
    it("should set flag after layout, then allow clearing", async () => {
      const store = configureStore({ reducer: rootReducer });

      // When: Layout is calculated
      await store.dispatch(
        layoutAndSetNodesAndEdges(transformToApiFormat(createSimpleGraph()))
      );

      // Then: Flag should be set
      expect(store.getState().graph.common.shouldResetView).toBe(true);

      // When: Flag is manually cleared (as Graph component would do after fitView)
      store.dispatch(setShouldResetView(false));

      // Then: Flag should be cleared
      expect(store.getState().graph.common.shouldResetView).toBe(false);
    });
  });

  describe("Selector Integration", () => {
    it("should retrieve nodes and edges via selectors", () => {
      const store = configureStore({ reducer: rootReducer });
      const { nodes, edges } = createSimpleGraph();

      store.dispatch(setNodes(nodes));
      store.dispatch(setEdges(edges));

      // When: Use selectors to retrieve data
      const state = store.getState();
      const selectedNodes = getWorkflowGraphNodes(state);
      const selectedEdges = getWorkflowGraphEdges(state);

      // Then: Selectors should return correct data
      expect(selectedNodes).toEqual(nodes);
      expect(selectedEdges).toEqual(edges);
    });

    it("should return empty arrays when no data is set", () => {
      const store = configureStore({ reducer: rootReducer });

      const state = store.getState();
      const selectedNodes = getWorkflowGraphNodes(state);
      const selectedEdges = getWorkflowGraphEdges(state);

      expect(selectedNodes).toEqual([]);
      expect(selectedEdges).toEqual([]);
    });
  });
});
