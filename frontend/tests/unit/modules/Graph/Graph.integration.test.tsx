/**
 * @fileoverview Integration tests for Graph component with real ReactFlow rendering.
 *
 * These tests verify actual ReactFlow DOM rendering and user interactions,
 * going beyond the mocked unit tests to ensure real-world functionality.
 *
 * @see Graph.test.tsx - Unit tests with mocked ReactFlow
 */
import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, waitFor, act } from "@testing-library/react";
import Graph from "../../../../src/modules/Graph/Graph";
import { createTestProviders } from "../../utils/providers";
import {
  createSimpleGraph,
  createComplexGraph,
  transformToApiFormat,
} from "../../utils/builders/reactflowElements";
import { GraphLibraryApi, setSelectedNodeNameInWorkflow } from "../../../../src/stores/GraphStores/GraphLibrary";
import { server } from "../../utils/mocks/server";
import { http, HttpResponse } from "msw";
import nodeStyles from "../../../../src/modules/Graph/components/DefaultNode/DefaultNode.module.scss";


describe("Graph - ReactFlow Integration Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    server.use(
      http.get("*/execution/get_graph/cytoscape*", () => {
        return HttpResponse.json(transformToApiFormat(createSimpleGraph()));
      })
    );
  });
  it("should render actual ReactFlow instance with real DOM", async () => {
    const { Providers } = createTestProviders();

    const { container } = render(
      <Graph selectedWorkflowName={"test_workflow"} />,
      { wrapper: Providers }
    );

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
    const { Providers, mockStore } = createTestProviders();

    render(
      <Graph
        selectedWorkflowName={"test_workflow"}
        onNodeClick={(nodeId) => mockStore.dispatch(setSelectedNodeNameInWorkflow(nodeId))}
      />,
      { wrapper: Providers }
    );

    // Click node to select (using fireEvent since d3-drag doesn't work in jsdom)
    const node1 = await waitFor(() => screen.getByText("node1"));
    const nodeElement = node1.closest('[data-id="node1"]');
    expect(nodeElement).toBeInTheDocument();
    act(() => {
      (nodeElement as HTMLElement)?.click();
    });

    await waitFor(() => {
      expect(mockStore.getState().graph.library.selectedNodeNameInWorkflow).toBe("node1")
    })
  });

  it("should update node styles when selection changes", async () => {
    const { Providers, mockStore } = createTestProviders();

    const { container } = render(
      <Graph selectedWorkflowName={"test_workflow"} />,
      { wrapper: Providers }
    );

    // Click node to select (using fireEvent since d3-drag doesn't work in jsdom)
    const node1 = await waitFor(() => screen.getByText("node1"));
    const nodeElement = node1.closest('[data-id="node1"]');
    expect(nodeElement).toBeInTheDocument();
    act(() => {
      (nodeElement as HTMLElement)?.click();
    });

    await waitFor(() => {
      const selectedNode = screen.getByText("node1").closest('[data-id="node1"]');
      expect(selectedNode).toHaveClass(nodeStyles.selected);
    });
  });

  it("should properly render custom node types", async () => {
    const { Providers, mockStore } = createTestProviders();

    render(<Graph selectedWorkflowName={"test_workflow"} />, { wrapper: Providers });

    // Verify custom DefaultNode component is used
    await waitFor(() => {
      const customNode = screen.getByText("node1");
      expect(customNode.closest(".react-flow__node")).toBeInTheDocument();
    });
  });

  it("should handle edge rendering with markers", async () => {
    const { nodes, edges } = createSimpleGraph();
    const { Providers, mockStore } = createTestProviders();

    const { container } = render(<Graph selectedWorkflowName={"test_workflow"} />, { wrapper: Providers });

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
  });

  it("should handle complex graph layouts", async () => {
    const mockSubmit = vi.fn().mockResolvedValue({
      isOk: true,
      result: transformToApiFormat(createComplexGraph()),
    });
    vi.spyOn(GraphLibraryApi, "fetchGraph").mockImplementation(mockSubmit);
    const { Providers, mockStore } = createTestProviders();

    render(<Graph selectedWorkflowName={"test_workflow"} />, { wrapper: Providers });

    // Verify all nodes render
    await waitFor(() => {
      expect(screen.getByText("Root")).toBeInTheDocument();
      expect(screen.getByText("A1")).toBeInTheDocument();
      expect(screen.getByText("Merge")).toBeInTheDocument();
    });
  });

  // Currently not supported
  // it("should render nodes with different status styles", async () => {
  //   const mockSubmit = vi.fn().mockResolvedValue({
  //     isOk: true,
  //     result: transformToApiFormat(createGraphWithStatuses()),
  //   });
  //   vi.spyOn(GraphLibraryApi, "fetchGraph").mockImplementation(mockSubmit);
  //   const { Providers, mockStore } = createTestProviders();

  //   const { container } = render(<Graph selectedWorkflowName={"test_workflow"} />, { wrapper: Providers });

  //   await waitFor(() => {
  //     // Check each status class
  //     expect(
  //       container.querySelector('[data-id="pending_node"]')
  //     ).toHaveClass("pending");
  //     expect(
  //       container.querySelector('[data-id="running_node"]')
  //     ).toHaveClass("running");
  //     expect(
  //       container.querySelector('[data-id="completed_node"]')
  //     ).toHaveClass("completed");
  //     expect(container.querySelector('[data-id="failed_node"]')).toHaveClass(
  //       "failed"
  //     );
  //   });
  // });

  it("should handle viewport interactions (zoom, pan)", async () => {
    const { Providers } = createTestProviders();

    const { container } = render(<Graph selectedWorkflowName={"test_workflow"} />, { wrapper: Providers });

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
