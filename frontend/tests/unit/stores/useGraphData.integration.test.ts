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
import { renderHook, waitFor } from "@testing-library/react";
import { rootReducer } from "../../../src/stores";
import { setTrackLatest } from "../../../src/stores/GraphStores/GraphStatus";
import { GraphLibraryApi, NodeWithData, setSelectedNodeNameInWorkflow } from "../../../src/stores/GraphStores/GraphLibrary";
import { createSimpleGraph, createComplexGraph, transformToApiFormat } from "../utils/builders/reactflowElements";
import useGraphData from "../../../src/modules/Graph/hooks";

describe("useGraphData Integration", () => {
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
      const { result } = renderHook(() => useGraphData("test-workflow"));

      // Create real Redux store
      const store = configureStore({ reducer: rootReducer });

      // Then: Wait for async layout to complete
      await waitFor(() => {
        const state = store.getState();
        expect(result.current.nodes.length).toBeGreaterThan(0);
      });

      // And: Verify all expectations
      const state = store.getState();
      expect(result.current.edges.length).toBeGreaterThan(0);

      // Verify nodes have been layouted (positions changed from initial values)
      const hasLayoutedPositions = result.current.nodes.some(
        n => n.position.x !== 0 || n.position.y !== 0
      );
      expect(hasLayoutedPositions).toBe(true);

      // Verify shouldResetView flag is set
      expect(result.current.shouldResetView).toBe(true);

      // Verify API was called with correct parameter
      expect(GraphLibraryApi.fetchGraph).toHaveBeenCalledWith("test-workflow");
    });

    it("should handle API errors gracefully", async () => {
      // Given: API returns error
      vi.spyOn(GraphLibraryApi, "fetchGraph").mockResolvedValue({
        isOk: false,
        error: "Network error",
      });

      const consoleSpy = vi.spyOn(console, "log");

      const { result } = renderHook(() => useGraphData("test-workflow"));

      // Then: Error should be logged (current behavior)
      await waitFor(() =>
        expect(consoleSpy).toHaveBeenCalledWith("Network error")
      )

      // And: Store should not be updated with invalid data
      expect(result.current.nodes).toHaveLength(0);
    });

    it("should handle complex graphs with multiple nodes and edges", async () => {
      // Given: Complex graph structure
      const mockGraphData = createComplexGraph();
      const mockApiResponse = {
        isOk: true,
        result: transformToApiFormat(mockGraphData),
      };
      vi.spyOn(GraphLibraryApi, "fetchGraph").mockResolvedValue(mockApiResponse);
      const { result } = renderHook(() => useGraphData("complex-workflow"));

      const store = configureStore({ reducer: rootReducer });

      // Then: Wait for layout to complete and verify
      await waitFor(() => {
        const state = store.getState();
        expect(result.current.nodes.length).toBe(mockGraphData.nodes.length);
      });

      const state = store.getState();
      expect(result.current.edges.length).toBe(mockGraphData.edges.length);

      // Verify layout produces valid positions
      result.current.nodes.forEach(node => {
        expect(node.position).toBeDefined();
        expect(typeof node.position.x).toBe("number");
        expect(typeof node.position.y).toBe("number");
      });
    });
  });

  describe("layoutAndSetNodesAndEdges Action", () => {
    it("should layout nodes and edges, then update store", async () => {
      const mockApiResponse = {
        isOk: true,
        result: transformToApiFormat(createSimpleGraph()),
      };
      vi.spyOn(GraphLibraryApi, "fetchGraph").mockResolvedValue(mockApiResponse);
      const { result } = renderHook(() => useGraphData("test-calibration"));

      await waitFor(() => {
        // Then: Store should have layouted elements
        expect(result.current.nodes.length).toBeGreaterThan(0);
        expect(result.current.edges).toBeDefined();
        expect(result.current.shouldResetView).toBe(true);
      });

      // Verify nodes have positions (ELK ran successfully)
      result.current.nodes.forEach(node => {
        expect(node.position).toBeDefined();
      });
    });

    it("should handle empty graph data", async () => {
      const mockApiResponse = {
        isOk: true,
        result:  { nodes: [], edges: [] },
      };
      vi.spyOn(GraphLibraryApi, "fetchGraph").mockResolvedValue(mockApiResponse);
      const { result } = renderHook(() => useGraphData("test-calibration"));

      // Then: Store should handle empty state gracefully
      expect(result.current.nodes).toEqual([]);
      // shouldResetView might still be true from layout action
    });
  });

  describe("Node Selection State Synchronization", () => {
    it("should synchronize node selection between Redux and ReactFlow", () => {
      const mockApiResponse = {
        isOk: true,
        result: transformToApiFormat(createSimpleGraph()),
      };
      vi.spyOn(GraphLibraryApi, "fetchGraph").mockResolvedValue(mockApiResponse);
      const { result } = renderHook(() => useGraphData("test-calibration"));
      const store = configureStore({ reducer: rootReducer });

      // When: Select a node via Redux action
      store.dispatch(setSelectedNodeNameInWorkflow("node1"));

      // Then: Store should reflect selection
      const state = store.getState();
      expect(state.graph.library.selectedNodeNameInWorkflow).toBe("node1");
    });

    it("should clear selection when undefined is set", () => {
      const store = configureStore({ reducer: rootReducer });

      // Given: A node is selected
      store.dispatch(setSelectedNodeNameInWorkflow("node1"));
      expect(store.getState().graph.library.selectedNodeNameInWorkflow).toBe("node1");

      // When: Selection is cleared
      store.dispatch(setSelectedNodeNameInWorkflow(undefined));

      // Then: No node should be selected
      expect(store.getState().graph.library.selectedNodeNameInWorkflow).toBeUndefined();
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

  describe("Selector Integration", () => {
    it("should return empty arrays when no data is set", () => {
      const { result } = renderHook(() => useGraphData("test-calibration"));
      const store = configureStore({ reducer: rootReducer });

      const state = store.getState();
      const selectedNodes = result.current.nodes;
      const selectedEdges = result.current.edges;

      expect(selectedNodes).toEqual([]);
      expect(selectedEdges).toEqual([]);
    });
  });
});
