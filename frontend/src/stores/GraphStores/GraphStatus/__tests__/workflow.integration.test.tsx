/**
 * @fileoverview Real-World Workflow Integration Tests - Graph State Updates
 *
 * Tests state synchronization during execution monitoring:
 * - Status update workflow during execution
 * - Selection state management
 * - Performance with rapid updates
 *
 * @see Graph component integration with GraphStatus
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, waitFor, act } from "@testing-library/react";
import Graph from "@/modules/GraphLibrary/components/Graph/Graph";
import { createTestProviders } from "@/test-utils/providers";
import {
  createSimpleGraph,
  createGraphWithStatuses,
} from "@/test-utils/builders/reactflowElements";
import { setNodes, setEdges, setSelectedNodeNameInWorkflow } from "@/stores/GraphStores/GraphCommon/actions";

describe("Real-World Workflows - Graph State Updates", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should update graph node statuses during execution", async () => {
    const { Providers, mockStore } = createTestProviders();

    // Setup: Initial graph with pending nodes
    const { nodes, edges } = createGraphWithStatuses();
    act(() => {
      mockStore.dispatch(setNodes(nodes));
      mockStore.dispatch(setEdges(edges));
    });

    const { rerender } = render(<Graph />, { wrapper: Providers });

    // Verify initial state
    await waitFor(() => {
      const state = mockStore.getState();
      expect(state.graph.common.nodes.length).toBe(nodes.length);
    });

    // When: Simulate status update (e.g., from WebSocket)
    const updatedNodes = nodes.map((n) =>
      n.id === "pending_node"
        ? {
            ...n,
            data: { ...n.data, status: "running" },
            className: "running",
          }
        : n
    );

    act(() => {
      mockStore.dispatch(setNodes(updatedNodes));
      rerender(<Graph />);
    });

    // Then: Node should have updated status in state
    await waitFor(() => {
      const state = mockStore.getState();
      const runningNode = state.graph.common.nodes.find(n => n.id === "pending_node");
      expect(runningNode?.className).toBe("running");
    });
  });

  it("should manage selection state correctly", async () => {
    const { Providers, mockStore } = createTestProviders();

    // Setup: Graph with nodes
    const { nodes, edges } = createSimpleGraph();
    act(() => {
      mockStore.dispatch(setNodes(nodes));
      mockStore.dispatch(setEdges(edges));
    });

    render(<Graph />, { wrapper: Providers });

    // When: Set selection via Redux
    act(() => {
      mockStore.dispatch(setSelectedNodeNameInWorkflow("node1"));
    });

    // Then: Selection should be reflected in state
    await waitFor(() => {
      expect(mockStore.getState().graph.common.selectedNodeNameInWorkflow).toBe("node1");
    });

    // When: Clear selection
    act(() => {
      mockStore.dispatch(setSelectedNodeNameInWorkflow(undefined));
    });

    // Then: Selection should be cleared
    await waitFor(() => {
      expect(mockStore.getState().graph.common.selectedNodeNameInWorkflow).toBeUndefined();
    });
  });

  it("should handle rapid status updates efficiently", async () => {
    const { Providers, mockStore } = createTestProviders();

    // Setup: Graph with status nodes
    const { nodes, edges } = createGraphWithStatuses();
    act(() => {
      mockStore.dispatch(setNodes(nodes));
      mockStore.dispatch(setEdges(edges));
    });

    const { rerender } = render(<Graph />, { wrapper: Providers });

    // When: Simulate rapid status updates (10 updates)
    const startTime = performance.now();

    act(() => {
      for (let i = 0; i < 10; i++) {
        const updatedNodes = nodes.map((n) => ({
          ...n,
          data: { ...n.data, updateCount: i, status: i % 2 === 0 ? "running" : "completed" },
          className: i % 2 === 0 ? "running" : "completed",
        }));
        mockStore.dispatch(setNodes(updatedNodes));
        rerender(<Graph />);
      }
    });

    const endTime = performance.now();

    // Then: Updates should complete quickly (< 1 second for 10 updates)
    expect(endTime - startTime).toBeLessThan(1000);

    // And: Final state should be reflected
    await waitFor(() => {
      const state = mockStore.getState();
      expect(state.graph.common.nodes.length).toBe(nodes.length);
    });
  });
});
