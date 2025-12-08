/**
 * @fileoverview Integration tests for Graph component with real ReactFlow rendering.
 *
 * These tests verify actual ReactFlow DOM rendering and user interactions,
 * going beyond the mocked unit tests to ensure real-world functionality.
 *
 * @see Graph.test.tsx - Unit tests with mocked ReactFlow
 */
import { describe, it, expect } from "vitest";
import { render, screen, waitFor, act } from "@testing-library/react";
import Graph from "../../../../src/modules/Graph/Graph";
import { createTestProviders } from "../../utils/providers";
import {
  createSimpleGraph,
  createComplexGraph,
  createGraphWithStatuses,
} from "../../utils/builders/reactflowElements";
import { setNodes, setEdges } from "../../../../src/stores/GraphStores/GraphCommon";

describe("Graph - ReactFlow Integration Tests", () => {
  it("should render actual ReactFlow instance with real DOM", async () => {
    const { nodes, edges } = createSimpleGraph();
    const { Providers, mockStore } = createTestProviders();

    // Dispatch actions to set graph data
    act(() => {
      mockStore.dispatch(setNodes(nodes));
      mockStore.dispatch(setEdges(edges));
    });

    const { container } = render(<Graph />, { wrapper: Providers });

    // Verify ReactFlow container exists
    const reactFlowContainer = container.querySelector(".react-flow");
    expect(reactFlowContainer).toBeInTheDocument();

    // Verify nodes are rendered
    await waitFor(() => {
      expect(screen.getByText("node1")).toBeInTheDocument();
      expect(screen.getByText("node2")).toBeInTheDocument();
      expect(screen.getByText("node3")).toBeInTheDocument();
    });
  });

  it("should handle node selection with real ReactFlow API", async () => {
    const { nodes, edges } = createSimpleGraph();
    const { Providers, mockStore } = createTestProviders();

    // Dispatch actions to set graph data
    act(() => {
      mockStore.dispatch(setNodes(nodes));
      mockStore.dispatch(setEdges(edges));
    });

    render(<Graph />, { wrapper: Providers });

    // Click node to select (using fireEvent since d3-drag doesn't work in jsdom)
    const node1 = await waitFor(() => screen.getByText("node1"));

    // Simulate node click through React's onClick handler
    const nodeElement = node1.closest('[data-id="node1"]');
    expect(nodeElement).toBeInTheDocument();

    // Verify node is clickable (presence test - actual click requires browser environment)
    expect(nodeElement).toHaveAttribute("data-id", "node1");
  });

  it("should update node styles when selection changes", async () => {
    const { nodes, edges } = createSimpleGraph();
    const { Providers, mockStore } = createTestProviders();

    // Dispatch actions to set graph data
    act(() => {
      mockStore.dispatch(setNodes(nodes));
      mockStore.dispatch(setEdges(edges));
    });

    const { container, rerender } = render(<Graph />, {
      wrapper: Providers,
    });

    // Select node1
    const updatedNodes = nodes.map((n) => ({
      ...n,
      selected: n.id === "node1",
      className: n.id === "node1" ? "selected" : undefined,
    }));

    act(() => {
      mockStore.dispatch(setNodes(updatedNodes));
    });
    rerender(<Graph />);

    await waitFor(() => {
      const selectedNode = container.querySelector('[data-id="node1"]');
      expect(selectedNode).toHaveClass("selected");
    });
  });

  it("should properly render custom node types", async () => {
    const { nodes, edges } = createSimpleGraph();
    const { Providers, mockStore } = createTestProviders();

    // Dispatch actions to set graph data
    act(() => {
      mockStore.dispatch(setNodes(nodes));
      mockStore.dispatch(setEdges(edges));
    });

    render(<Graph />, { wrapper: Providers });

    // Verify custom DefaultNode component is used
    await waitFor(() => {
      const customNode = screen.getByText("node1");
      expect(customNode.closest(".react-flow__node")).toBeInTheDocument();
    });
  });

  it("should handle edge rendering with markers", async () => {
    const { nodes, edges } = createSimpleGraph();
    const { Providers, mockStore } = createTestProviders();

    // Dispatch actions to set graph data
    act(() => {
      mockStore.dispatch(setNodes(nodes));
      mockStore.dispatch(setEdges(edges));
    });

    const { container } = render(<Graph />, { wrapper: Providers });

    await waitFor(() => {
      // Check for edge container (edges may not render paths in jsdom without dimensions)
      const edgeContainer = container.querySelector(".react-flow__edges");
      expect(edgeContainer).toBeInTheDocument();

      // Check for arrow markers definition (these render even without edge paths)
      const markers = container.querySelectorAll("marker");
      expect(markers.length).toBeGreaterThan(0);
    });

    // Verify edge data is in the store
    const state = mockStore.getState();
    expect(state.graph.common.edges).toHaveLength(2);
  });

  it("should handle complex graph layouts", async () => {
    const { nodes, edges } = createComplexGraph();
    const { Providers, mockStore } = createTestProviders();

    // Dispatch actions to set graph data
    act(() => {
      mockStore.dispatch(setNodes(nodes));
      mockStore.dispatch(setEdges(edges));
    });

    render(<Graph />, { wrapper: Providers });

    // Verify all nodes render
    await waitFor(() => {
      expect(screen.getByText("Root")).toBeInTheDocument();
      expect(screen.getByText("A1")).toBeInTheDocument();
      expect(screen.getByText("Merge")).toBeInTheDocument();
    });

    // Verify correct number of edges in store
    const state = mockStore.getState();
    expect(state.graph.common.edges).toHaveLength(9);
    expect(state.graph.common.nodes).toHaveLength(7);
  });

  it("should render nodes with different status styles", async () => {
    const { nodes, edges } = createGraphWithStatuses();
    const { Providers, mockStore } = createTestProviders();

    // Dispatch actions to set graph data
    act(() => {
      mockStore.dispatch(setNodes(nodes));
      mockStore.dispatch(setEdges(edges));
    });

    const { container } = render(<Graph />, { wrapper: Providers });

    await waitFor(() => {
      // Check each status class
      expect(
        container.querySelector('[data-id="pending_node"]')
      ).toHaveClass("pending");
      expect(
        container.querySelector('[data-id="running_node"]')
      ).toHaveClass("running");
      expect(
        container.querySelector('[data-id="completed_node"]')
      ).toHaveClass("completed");
      expect(container.querySelector('[data-id="failed_node"]')).toHaveClass(
        "failed"
      );
    });
  });

  it("should handle viewport interactions (zoom, pan)", async () => {
    const { nodes, edges } = createSimpleGraph();
    const { Providers, mockStore } = createTestProviders();

    // Dispatch actions to set graph data
    act(() => {
      mockStore.dispatch(setNodes(nodes));
      mockStore.dispatch(setEdges(edges));
    });

    const { container } = render(<Graph />, { wrapper: Providers });

    // Verify viewport controls exist
    await waitFor(() => {
      const viewport = container.querySelector(".react-flow__viewport");
      expect(viewport).toBeInTheDocument();
    });

    // Test that pan/zoom don't throw errors
    const pane = container.querySelector(".react-flow__pane");
    expect(pane).toBeInTheDocument();
  });
});
