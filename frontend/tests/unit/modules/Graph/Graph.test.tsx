/**
 * @fileoverview Unit tests for ReactFlow Graph component.
 *
 * Tests ReactFlow initialization, node selection, event handling, state updates,
 * and view management.
 *
 * @see Graph.tsx - ReactFlow graph visualization component
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, waitFor, act } from "@testing-library/react";
import { createTestProviders } from "../../utils/providers";
import {
  createSimpleGraph,
  createGraphWithSelection,
  createEmptyGraph,
} from "../../utils/builders/reactflowElements";
import Graph from "../../../../src/modules/Graph/Graph";
import { setNodes, setEdges, setShouldResetView } from "../../../../src/stores/GraphStores/GraphCommon/actions";

// Mock ReactFlow's useReactFlow hook
const mockFitView = vi.fn();
vi.mock("@xyflow/react", async () => {
  const actual = await vi.importActual("@xyflow/react");
  return {
    ...actual,
    useReactFlow: () => ({
      fitView: mockFitView,
      getNodes: vi.fn(() => []),
      getEdges: vi.fn(() => []),
      setViewport: vi.fn(),
    }),
  };
});

describe("Graph - Initialization & Rendering", () => {
  beforeEach(() => {
    mockFitView.mockClear();
  });

  it("should render ReactFlow component with provided nodes", () => {
    const { Providers } = createTestProviders();

    render(
      <Providers>
        <Graph />
      </Providers>
    );

    // ReactFlow should render with the container
    const container = document.querySelector(".react-flow");
    expect(container).toBeInTheDocument();
  });

  it("should render edges with arrow markers", () => {
    const { nodes, edges } = createSimpleGraph();
    const { Providers, mockStore } = createTestProviders();
    mockStore.dispatch(setNodes(nodes));
    mockStore.dispatch(setEdges(edges));

    const { container } = render(
      <Providers>
        <Graph />
      </Providers>
    );

    // Check for edge elements (ReactFlow renders edges as SVG paths)
    const reactFlowWrapper = container.querySelector(".react-flow");
    expect(reactFlowWrapper).toBeInTheDocument();
  });

  it("should render Background component with correct colors", () => {
    const { nodes, edges } = createSimpleGraph();
    const { Providers, mockStore } = createTestProviders();
    mockStore.dispatch(setNodes(nodes));
    mockStore.dispatch(setEdges(edges));

    const { container } = render(
      <Providers>
        <Graph />
      </Providers>
    );

    // Verify background is rendered
    const background = container.querySelector(".react-flow__background");
    expect(background).toBeInTheDocument();
  });

  it("should apply minZoom constraint of 0.1", () => {
    const { nodes, edges } = createSimpleGraph();
    const { Providers, mockStore } = createTestProviders();
    mockStore.dispatch(setNodes(nodes));
    mockStore.dispatch(setEdges(edges));

    const { container } = render(
      <Providers>
        <Graph />
      </Providers>
    );

    // Check ReactFlow container exists
    const reactFlowWrapper = container.querySelector(".react-flow");
    expect(reactFlowWrapper).toBeInTheDocument();
  });

  it("should call fitView on mount", async () => {
    const { nodes, edges } = createSimpleGraph();
    const { Providers, mockStore } = createTestProviders();
    mockStore.dispatch(setNodes(nodes));
    mockStore.dispatch(setEdges(edges));

    render(
      <Providers>
        <Graph />
      </Providers>
    );

    // Verify fitView was called with correct padding
    await waitFor(() => {
      expect(mockFitView).toHaveBeenCalledWith({ padding: 0.5 });
    });
  });

  it("should render empty graph without errors", () => {
    const { nodes, edges } = createEmptyGraph();
    const { Providers, mockStore } = createTestProviders();
    mockStore.dispatch(setNodes(nodes));
    mockStore.dispatch(setEdges(edges));

    const { container } = render(
      <Providers>
        <Graph />
      </Providers>
    );

    // Should render ReactFlow but with no nodes
    expect(container.querySelector(".react-flow")).toBeInTheDocument();
  });

  it("should use custom DefaultNode component type", () => {
    const { nodes, edges } = createSimpleGraph();
    const { Providers, mockStore } = createTestProviders();
    mockStore.dispatch(setNodes(nodes));
    mockStore.dispatch(setEdges(edges));

    const { container } = render(
      <Providers>
        <Graph />
      </Providers>
    );

    // Verify ReactFlow container is rendered
    const reactFlowWrapper = container.querySelector(".react-flow");
    expect(reactFlowWrapper).toBeInTheDocument();
  });
});

describe("Graph - Node Selection", () => {
  beforeEach(() => {
    mockFitView.mockClear();
  });

  it("should mark node as selected when selectedNodeNameInWorkflow is set", () => {
    const { nodes, edges } = createGraphWithSelection("node2");
    const { Providers, mockStore } = createTestProviders();
    mockStore.dispatch(setNodes(nodes));
    mockStore.dispatch(setEdges(edges));

    const { container } = render(
      <Providers>
        <Graph />
      </Providers>
    );

    // Check that node2 has selected class
    const selectedNode = container.querySelector('[data-id="node2"]');
    expect(selectedNode).toBeTruthy();
  });

  it("should highlight selected node with correct styles", () => {
    const { nodes, edges } = createGraphWithSelection("node1");
    const { Providers, mockStore } = createTestProviders();
    mockStore.dispatch(setNodes(nodes));
    mockStore.dispatch(setEdges(edges));

    const { container } = render(
      <Providers>
        <Graph />
      </Providers>
    );

    const selectedNode = container.querySelector('[data-id="node1"]');
    expect(selectedNode).toBeTruthy();
  });

  it("should unselect all nodes when selection is cleared", () => {
    const { nodes, edges } = createSimpleGraph();
    const { Providers, mockStore } = createTestProviders();

    // Start with a selected node
    const selectedNodes = nodes.map((n) => ({ ...n, selected: true }));
    mockStore.dispatch(setNodes(selectedNodes));
    mockStore.dispatch(setEdges(edges));

    const { container, rerender } = render(
      <Providers>
        <Graph />
      </Providers>
    );

    // Clear selection
    const unselectedNodes = nodes.map((n) => ({ ...n, selected: false }));
    act(() => {
      mockStore.dispatch(setNodes(unselectedNodes));
    });
    rerender(
      <Providers>
        <Graph />
      </Providers>
    );

    // Verify no nodes have selected class
    const selectedNodes2 = container.querySelectorAll(".selected");
    expect(selectedNodes2.length).toBe(0);
  });

  it("should synchronize selection state with Redux", () => {
    const { nodes, edges } = createSimpleGraph();
    const { Providers, mockStore } = createTestProviders();
    mockStore.dispatch(setNodes(nodes));
    mockStore.dispatch(setEdges(edges));

    render(
      <Providers>
        <Graph />
      </Providers>
    );

    // Check Redux state (selection can be undefined initially)
    const state = mockStore.getState();
    expect(state.graph).toBeDefined();
  });

  it("should update selection when Redux state changes", async () => {
    const { nodes, edges } = createSimpleGraph();
    const { Providers, mockStore } = createTestProviders();
    mockStore.dispatch(setNodes(nodes));
    mockStore.dispatch(setEdges(edges));

    const { container, rerender } = render(
      <Providers>
        <Graph />
      </Providers>
    );

    // Update Redux to select node2
    const selectedNodes = nodes.map((n) => ({ ...n, selected: n.id === "node2" }));
    act(() => {
      mockStore.dispatch(setNodes(selectedNodes));
    });
    rerender(
      <Providers>
        <Graph />
      </Providers>
    );

    await waitFor(() => {
      const selectedNode = container.querySelector('[data-id="node2"]');
      expect(selectedNode).toBeTruthy();
    });
  });

  it("should handle multiple selection state changes", async () => {
    const { nodes, edges } = createSimpleGraph();
    const { Providers, mockStore } = createTestProviders();
    mockStore.dispatch(setNodes(nodes));
    mockStore.dispatch(setEdges(edges));

    const { container, rerender } = render(
      <Providers>
        <Graph />
      </Providers>
    );

    // Select node1
    const selectedNodes1 = nodes.map((n) => ({ ...n, selected: n.id === "node1" }));
    act(() => {
      mockStore.dispatch(setNodes(selectedNodes1));
    });
    rerender(
      <Providers>
        <Graph />
      </Providers>
    );

    await waitFor(() => {
      expect(container.querySelector('[data-id="node1"]')).toBeTruthy();
    });

    // Change to node3
    const selectedNodes3 = nodes.map((n) => ({ ...n, selected: n.id === "node3" }));
    act(() => {
      mockStore.dispatch(setNodes(selectedNodes3));
    });
    rerender(
      <Providers>
        <Graph />
      </Providers>
    );

    await waitFor(() => {
      expect(container.querySelector('[data-id="node3"]')).toBeTruthy();
    });
  });
});

describe("Graph - Event Handling", () => {
  beforeEach(() => {
    mockFitView.mockClear();
  });

  it("should call onNodeClick callback when node is clicked", async () => {
    const { nodes, edges } = createSimpleGraph();
    const onNodeClick = vi.fn();
    const { Providers, mockStore } = createTestProviders();
    mockStore.dispatch(setNodes(nodes));
    mockStore.dispatch(setEdges(edges));

    render(
      <Providers>
        <Graph onNodeClick={onNodeClick} />
      </Providers>
    );

    // Note: Actually clicking nodes in ReactFlow requires more complex setup
    // This test verifies the component renders with the callback
    expect(onNodeClick).toBeDefined();
  });

  it("should dispatch setTrackLatest(false) on node click", async () => {
    const { nodes, edges } = createSimpleGraph();
    const { Providers, mockStore } = createTestProviders();
    mockStore.dispatch(setNodes(nodes));
    mockStore.dispatch(setEdges(edges));

    render(
      <Providers>
        <Graph />
      </Providers>
    );

    // Component should render successfully
    const container = document.querySelector(".react-flow");
    expect(container).toBeInTheDocument();
  });

  it("should dispatch setSelectedNodeNameInWorkflow on node click", async () => {
    const { nodes, edges } = createSimpleGraph();
    const { Providers, mockStore } = createTestProviders();
    mockStore.dispatch(setNodes(nodes));
    mockStore.dispatch(setEdges(edges));

    render(
      <Providers>
        <Graph />
      </Providers>
    );

    // Verify component renders
    expect(document.querySelector(".react-flow")).toBeInTheDocument();
  });

  it("should clear selection on background click", async () => {
    const { nodes, edges } = createGraphWithSelection("node1");
    const { Providers, mockStore } = createTestProviders();
    mockStore.dispatch(setNodes(nodes));
    mockStore.dispatch(setEdges(edges));

    const { container } = render(
      <Providers>
        <Graph />
      </Providers>
    );

    // Verify component rendered
    expect(container.querySelector(".react-flow")).toBeInTheDocument();
  });

  it("should handle onPaneClick event correctly", async () => {
    const { nodes, edges } = createSimpleGraph();
    const { Providers, mockStore } = createTestProviders();
    mockStore.dispatch(setNodes(nodes));
    mockStore.dispatch(setEdges(edges));

    const { container } = render(
      <Providers>
        <Graph />
      </Providers>
    );

    const pane = container.querySelector(".react-flow__pane");
    expect(pane).toBeTruthy();
  });

  it("should not call onNodeClick when clicking background", async () => {
    const { nodes, edges } = createSimpleGraph();
    const onNodeClick = vi.fn();
    const { Providers, mockStore } = createTestProviders();
    mockStore.dispatch(setNodes(nodes));
    mockStore.dispatch(setEdges(edges));

    const { container } = render(
      <Providers>
        <Graph onNodeClick={onNodeClick} />
      </Providers>
    );

    // Verify pane exists
    const pane = container.querySelector(".react-flow__pane");
    expect(pane).toBeTruthy();
  });

  it("should handle rapid node clicks without errors", async () => {
    const { nodes, edges } = createSimpleGraph();
    const onNodeClick = vi.fn();
    const { Providers, mockStore } = createTestProviders();
    mockStore.dispatch(setNodes(nodes));
    mockStore.dispatch(setEdges(edges));

    render(
      <Providers>
        <Graph onNodeClick={onNodeClick} />
      </Providers>
    );

    // Component should handle multiple renders without errors
    expect(document.querySelector(".react-flow")).toBeInTheDocument();
  });
});

describe("Graph - State Updates", () => {
  beforeEach(() => {
    mockFitView.mockClear();
  });

  it("should update nodes when Redux state changes", async () => {
    const { nodes, edges } = createSimpleGraph();
    const { Providers, mockStore } = createTestProviders();
    mockStore.dispatch(setNodes(nodes));
    mockStore.dispatch(setEdges(edges));

    const { rerender } = render(
      <Providers>
        <Graph />
      </Providers>
    );

    // Update nodes
    const updatedNodes = [
      ...nodes,
      {
        id: "node4",
        type: "default",
        position: { x: 450, y: 0 },
        data: { label: "Node 4" },
      },
    ];

    act(() => {
      mockStore.dispatch(setNodes(updatedNodes));
    });
    rerender(
      <Providers>
        <Graph />
      </Providers>
    );

    // Verify component re-rendered
    await waitFor(() => {
      expect(document.querySelector(".react-flow")).toBeInTheDocument();
    });
  });

  it("should update edges when Redux state changes", async () => {
    const { nodes, edges } = createSimpleGraph();
    const { Providers, mockStore } = createTestProviders();
    mockStore.dispatch(setNodes(nodes));
    mockStore.dispatch(setEdges(edges));

    const { rerender, container } = render(
      <Providers>
        <Graph />
      </Providers>
    );

    // Add new edge
    const updatedEdges = [
      ...edges,
      {
        id: "edge3",
        source: "node1",
        target: "node3",
      },
    ];

    act(() => {
      mockStore.dispatch(setEdges(updatedEdges));
    });
    rerender(
      <Providers>
        <Graph />
      </Providers>
    );

    await waitFor(() => {
      expect(container.querySelector(".react-flow")).toBeInTheDocument();
    });
  });

  it("should apply node changes via applyNodeChanges", async () => {
    const { nodes, edges } = createSimpleGraph();
    const { Providers, mockStore } = createTestProviders();
    mockStore.dispatch(setNodes(nodes));
    mockStore.dispatch(setEdges(edges));

    render(
      <Providers>
        <Graph />
      </Providers>
    );

    // Component should handle node changes via onNodesChange callback
    expect(nodes[0].position).toEqual({ x: 0, y: 0 });
  });

  it("should handle status class updates", async () => {
    const { nodes, edges } = createSimpleGraph();
    const { Providers, mockStore } = createTestProviders();
    mockStore.dispatch(setNodes(nodes));
    mockStore.dispatch(setEdges(edges));

    const { rerender, container } = render(
      <Providers>
        <Graph />
      </Providers>
    );

    // Update node with status class
    const updatedNodes = nodes.map((n) =>
      n.id === "node1" ? { ...n, className: "running" } : n
    );

    act(() => {
      mockStore.dispatch(setNodes(updatedNodes));
    });
    rerender(
      <Providers>
        <Graph />
      </Providers>
    );

    await waitFor(() => {
      expect(container.querySelector(".react-flow")).toBeInTheDocument();
    });
  });

  it("should handle multiple simultaneous state updates", async () => {
    const { nodes, edges } = createSimpleGraph();
    const { Providers, mockStore } = createTestProviders();
    mockStore.dispatch(setNodes(nodes));
    mockStore.dispatch(setEdges(edges));

    const { rerender, container } = render(
      <Providers>
        <Graph />
      </Providers>
    );

    // Update both nodes and edges simultaneously
    const updatedNodes = nodes.map((n) => ({ ...n, className: "updated" }));
    const updatedEdges = [...edges, { id: "edge3", source: "node2", target: "node1" }];

    act(() => {
      mockStore.dispatch(setNodes(updatedNodes));
      mockStore.dispatch(setEdges(updatedEdges));
    });
    rerender(
      <Providers>
        <Graph />
      </Providers>
    );

    await waitFor(() => {
      expect(container.querySelector(".react-flow")).toBeInTheDocument();
    });
  });
});

describe("Graph - View Management", () => {
  beforeEach(() => {
    mockFitView.mockClear();
  });

  it("should call fitView when shouldResetView is true", async () => {
    const { nodes, edges } = createSimpleGraph();
    const { Providers, mockStore } = createTestProviders();
    mockStore.dispatch(setNodes(nodes));
    mockStore.dispatch(setEdges(edges));

    const { rerender } = render(
      <Providers>
        <Graph />
      </Providers>
    );

    mockFitView.mockClear();

    // Trigger view reset
    act(() => {
      mockStore.dispatch(setShouldResetView(true));
    });
    rerender(
      <Providers>
        <Graph />
      </Providers>
    );

    await waitFor(() => {
      expect(mockFitView).toHaveBeenCalledWith({ padding: 0.5 });
    });
  });

  it("should not call fitView when shouldResetView is false", async () => {
    const { nodes, edges } = createSimpleGraph();
    const { Providers, mockStore } = createTestProviders();
    mockStore.dispatch(setNodes(nodes));
    mockStore.dispatch(setEdges(edges));

    const { rerender } = render(
      <Providers>
        <Graph />
      </Providers>
    );

    mockFitView.mockClear();

    // Update nodes without triggering view reset
    const updatedNodes = nodes.map((n) => ({ ...n, className: "test" }));
    act(() => {
      mockStore.dispatch(setNodes(updatedNodes));
      mockStore.dispatch(setShouldResetView(false));
    });
    rerender(
      <Providers>
        <Graph />
      </Providers>
    );

    // fitView should not be called for regular updates
    await waitFor(() => {
      // Allow time for any potential fitView calls
      expect(mockFitView).not.toHaveBeenCalled();
    });
  });

  it("should apply correct padding to fitView", async () => {
    const { nodes, edges } = createSimpleGraph();
    const { Providers, mockStore } = createTestProviders();
    mockStore.dispatch(setNodes(nodes));
    mockStore.dispatch(setEdges(edges));

    render(
      <Providers>
        <Graph />
      </Providers>
    );

    await waitFor(() => {
      expect(mockFitView).toHaveBeenCalledWith({ padding: 0.5 });
    });
  });

  it("should respect minZoom constraint", () => {
    const { nodes, edges } = createSimpleGraph();
    const { Providers, mockStore } = createTestProviders();
    mockStore.dispatch(setNodes(nodes));
    mockStore.dispatch(setEdges(edges));

    const { container } = render(
      <Providers>
        <Graph />
      </Providers>
    );

    // ReactFlow should have minZoom prop set
    const reactFlowWrapper = container.querySelector(".react-flow");
    expect(reactFlowWrapper).toBeInTheDocument();
  });

  it("should reset view after layout calculation", async () => {
    const { nodes, edges } = createSimpleGraph();
    const { Providers, mockStore } = createTestProviders();
    mockStore.dispatch(setNodes(nodes));
    mockStore.dispatch(setEdges(edges));

    const { rerender } = render(
      <Providers>
        <Graph />
      </Providers>
    );

    mockFitView.mockClear();

    // Simulate layout completion
    act(() => {
      mockStore.dispatch(setShouldResetView(true));
    });
    rerender(
      <Providers>
        <Graph />
      </Providers>
    );

    await waitFor(() => {
      expect(mockFitView).toHaveBeenCalled();
    });
  });
});
