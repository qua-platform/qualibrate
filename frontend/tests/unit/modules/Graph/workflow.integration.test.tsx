/**
 * @fileoverview Real-World Workflow Integration Tests - Graph Fetching
 *
 * Tests complete end-to-end data flow for graph fetching and rendering:
 * - Fetch workflow: API → transform → layout → store
 * - Error handling: API errors handled gracefully
 * - Retry mechanism: Failed fetches can be retried
 *
 * @see fetchWorkflowGraph action - Main integration point
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { configureStore } from "@reduxjs/toolkit";
import { waitFor } from "@testing-library/react";
import { createComplexGraph, transformToApiFormat } from "../../utils/builders/reactflowElements";
import { GraphLibraryApi } from "../../../../src/stores/GraphStores/GraphLibrary";
import { rootReducer } from "../../../../src/stores";
import { fetchWorkflowGraph } from "../../../../src/stores/GraphStores/GraphCommon";

describe("Real-World Workflows - Graph Data Fetching", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should complete full fetch workflow: API → transform → layout → store", async () => {
    // Setup: Mock API to return graph data
    const mockGraphData = createComplexGraph();
    vi.spyOn(GraphLibraryApi, "fetchGraph").mockResolvedValue({
      isOk: true,
      result: transformToApiFormat(mockGraphData),
    });

    const store = configureStore({ reducer: rootReducer });

    // When: Dispatch fetchWorkflowGraph action
    await store.dispatch(fetchWorkflowGraph("test-calibration"));

    // Then: API should be called
    expect(GraphLibraryApi.fetchGraph).toHaveBeenCalledWith("test-calibration");

    // And: Store should be updated with layouted data
    await waitFor(() => {
      const state = store.getState();
      expect(state.graph.common.nodes.length).toBeGreaterThan(0);
      expect(state.graph.common.shouldResetView).toBe(true);
    });
  });

  it("should handle API errors gracefully", async () => {
    // Given: API returns error
    vi.spyOn(GraphLibraryApi, "fetchGraph").mockResolvedValue({
      isOk: false,
      error: "Network timeout",
    });

    const store = configureStore({ reducer: rootReducer });
    const consoleSpy = vi.spyOn(console, "log");

    // When: Dispatch fetch action
    await store.dispatch(fetchWorkflowGraph("test-workflow"));

    // Then: Error should be logged
    expect(consoleSpy).toHaveBeenCalledWith("Network timeout");

    // And: Store should not have invalid data
    expect(store.getState().graph.common.nodes).toHaveLength(0);
  });

  it("should support retry mechanism on failures", async () => {
    const store = configureStore({ reducer: rootReducer });
    let apiCallCount = 0;

    // Given: API fails first time, succeeds second time
    vi.spyOn(GraphLibraryApi, "fetchGraph").mockImplementation(async () => {
      apiCallCount++;
      if (apiCallCount === 1) {
        return { isOk: false, error: "Temporary failure" };
      }
      return {
        isOk: true,
        result: transformToApiFormat(createComplexGraph()),
      };
    });

    // When: First fetch fails
    await store.dispatch(fetchWorkflowGraph("retry-test"));
    expect(apiCallCount).toBe(1);
    expect(store.getState().graph.common.nodes).toHaveLength(0);

    // When: User triggers retry
    await store.dispatch(fetchWorkflowGraph("retry-test"));

    // Then: Second call should succeed
    expect(apiCallCount).toBe(2);
    await waitFor(() => {
      expect(store.getState().graph.common.nodes.length).toBeGreaterThan(0);
    });
  });
});
