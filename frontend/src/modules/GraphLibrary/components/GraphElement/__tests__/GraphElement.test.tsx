import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { GraphElement } from "../GraphElement";
import { createTestProviders } from "@/test-utils/providers";
import * as GraphLibraryApiModule from "../../../api/GraphLibraryApi";
import { setAllGraphs, setSelectedWorkflowName } from "@/stores/GraphStores/GraphLibrary/actions";
import { setWorkflowGraphElements } from "@/stores/GraphStores/GraphCommon/actions";
import { getAllGraphs, getLastRunInfo, getSelectedWorkflowName } from "@/stores/GraphStores/GraphLibrary/selectors";
import { server } from "@/test-utils/mocks/server";
import { http, HttpResponse } from "msw";
import { getActivePage } from "@/stores/NavigationStore/selectors";

// Mock CytoscapeGraph to avoid Cytoscape dependencies
vi.mock("../../CytoscapeGraph/CytoscapeGraph", () => ({
  default: ({ elements }: { elements: unknown[] }) => (
    <div data-testid="cytoscape-graph">Cytoscape Graph with {elements?.length || 0} elements</div>
  ),
}));

describe("GraphElement - Parameter Management", () => {
  const mockGraph = {
    name: "test_workflow",
    description: "Test workflow description",
    parameters: {
      frequency: {
        default: 5.0,
        title: "Frequency",
        type: "number",
      },
      amplitude: {
        default: 0.5,
        title: "Amplitude",
        type: "number",
      },
    },
    nodes: {
      node1: {
        name: "node1",
        description: "Node 1 description",
        parameters: {
          samples: {
            default: 100,
            title: "Samples",
            type: "number",
          },
        },
      },
      node2: {
        name: "node2",
        description: "Node 2 description",
        parameters: {
          enabled: {
            default: true,
            title: "Enabled",
            type: "boolean",
          },
        },
      },
    },
    connectivity: [["node1", "node2"]],
  };

  beforeEach(() => {
    vi.clearAllMocks();

    server.use(
      http.get("/execution/get_graphs", () => {
        return HttpResponse.json({
          test_workflow: mockGraph
        })
      })
    );
  });

  it("should display graph parameters when selected", async () => {
    const { Providers, mockStore } = createTestProviders({
      selection: {
        selectedItemName: "test_workflow",
      },
    });
    //TODO: mock WebSocket event
    mockStore.dispatch(setSelectedWorkflowName('test_workflow'));
    mockStore.dispatch(setAllGraphs({ test_workflow: mockGraph }));

    render(
      <Providers>
        <GraphElement calibrationGraphKey="test_workflow" calibrationGraph={mockGraph} />
      </Providers>
    );

    // Parameters should be visible when selected (look for parameter labels with colon)
    await waitFor(() => {
      expect(screen.getByText(/Frequency/i)).toBeInTheDocument();
      expect(screen.getByText(/Amplitude/i)).toBeInTheDocument();
    });
  });

  it("should display node parameters in ParameterList", async () => {
    const { Providers, mockStore } = createTestProviders({
      selection: {
        selectedItemName: "test_workflow",
      },
    });
    //TODO: mock WebSocket event
    mockStore.dispatch(setSelectedWorkflowName('test_workflow'));
    mockStore.dispatch(setAllGraphs({ test_workflow: mockGraph }));

    render(
      <Providers>
        <GraphElement calibrationGraphKey="test_workflow" calibrationGraph={mockGraph} />
      </Providers>
    );

    // Node parameters should be rendered via ParameterList
    await waitFor(() => {
      expect(screen.getByText("node1")).toBeInTheDocument();
      expect(screen.getByText("node2")).toBeInTheDocument();
    });
  });

  it("should update parameter values in GraphContext", async () => {
    const { Providers, mockStore } = createTestProviders({
      selection: {
        selectedItemName: "test_workflow",
      },
    });
    //TODO: mock WebSocket event
    mockStore.dispatch(setSelectedWorkflowName('test_workflow'));

    render(
      <Providers>
        <GraphElement calibrationGraphKey="test_workflow" calibrationGraph={mockGraph} />
      </Providers>
    );

    // Find an input field and change its value
    await waitFor(() => {
      expect(screen.getByDisplayValue("5")).toBeInTheDocument();
    });

    const frequencyInput = screen.getByDisplayValue("5");
    fireEvent.change(frequencyInput, { target: { value: "6.5" } });

    // Verify setAllGraphs was called with updated parameters
    await waitFor(() => {
      expect(getAllGraphs(mockStore.getState())?.test_workflow.parameters?.frequency)
          .toHaveProperty('default', "6.5");
    });
  });

  it("should transform parameters for API submission", async () => {
    const mockSubmit = vi.fn().mockResolvedValue({ isOk: true });
    vi.spyOn(GraphLibraryApiModule.GraphLibraryApi, "submitWorkflow").mockImplementation(mockSubmit);

    const { Providers, mockStore } = createTestProviders({
      selection: {
        selectedItemName: "test_workflow",
      },
    });
    //TODO: mock WebSocket event
    mockStore.dispatch(setSelectedWorkflowName('test_workflow'));

    render(
      <Providers>
        <GraphElement calibrationGraphKey="test_workflow" calibrationGraph={mockGraph} />
      </Providers>
    );

    // Click run button
    await waitFor(() => {
      expect(screen.getByText("Run")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Run"));

    // Verify transformed parameters (flat key-value pairs, not InputParameter format)
    await waitFor(() => {
      expect(mockSubmit).toHaveBeenCalledWith("test_workflow", {
        parameters: {
          frequency: 5.0,
          amplitude: 0.5,
        },
        nodes: {
          node1: {
            parameters: {
              samples: 100,
            },
          },
          node2: {
            parameters: {
              enabled: true,
            },
          },
        },
      });
    });
  });
});

describe("GraphElement - Workflow Submission", () => {
  const mockGraph = {
    name: "test_workflow",
    description: "Test workflow",
    parameters: {
      frequency: {
        default: 5.0,
        title: "Frequency",
        type: "number",
      },
    },
    nodes: {
      node1: {
        name: "node1",
        description: "Node 1 description",
        parameters: {
          samples: {
            default: 100,
            title: "Samples",
            type: "number",
          },
        },
      },
    },
    connectivity: [["node1"]],
  };

  beforeEach(() => {
    vi.clearAllMocks();

    server.use(
      http.get("/execution/get_graphs", () => {
        return HttpResponse.json({
          test_workflow: mockGraph
        })
      })
    );
  });

  it("should submit workflow with transformed parameters", async () => {
    const mockSubmit = vi.fn().mockResolvedValue({ isOk: true });
    vi.spyOn(GraphLibraryApiModule.GraphLibraryApi, "submitWorkflow").mockImplementation(mockSubmit);

    const { Providers, mockStore } = createTestProviders({
      selection: {
        selectedItemName: "test_workflow",
      },
    });
    //TODO: mock WebSocket event
    mockStore.dispatch(setSelectedWorkflowName('test_workflow'));

    render(
      <Providers>
        <GraphElement calibrationGraphKey="test_workflow" calibrationGraph={mockGraph} />
      </Providers>
    );

    await waitFor(() => {
      expect(screen.getByText("Run")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Run"));

    await waitFor(() => {
      expect(mockSubmit).toHaveBeenCalledWith("test_workflow", expect.any(Object));
    });
  });

  it("should set lastRunInfo.active on submission", async () => {
    const mockSubmit = vi.fn().mockResolvedValue({ isOk: true });
    vi.spyOn(GraphLibraryApiModule.GraphLibraryApi, "submitWorkflow").mockImplementation(mockSubmit);

    const { Providers, mockStore } = createTestProviders({
      selection: {
        selectedItemName: "test_workflow",
      },
    });
    //TODO: mock WebSocket event
    mockStore.dispatch(setSelectedWorkflowName('test_workflow'));

    render(
      <Providers>
        <GraphElement calibrationGraphKey="test_workflow" calibrationGraph={mockGraph} />
      </Providers>
    );

    await waitFor(() => {
      expect(screen.getByText("Run")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Run"));

    // Verify setLastRunInfo was called with active: true
    await waitFor(() => {
      expect(getLastRunInfo(mockStore.getState())).toEqual({
        active: true,
      });
    });
  });

  it("should open graph-status tab on success", async () => {
    const mockSubmit = vi.fn().mockResolvedValue({ isOk: true });
    vi.spyOn(GraphLibraryApiModule.GraphLibraryApi, "submitWorkflow").mockImplementation(mockSubmit);

    const { Providers, mockStore } = createTestProviders({
      selection: {
        selectedItemName: "test_workflow",
      },
    });
    //TODO: mock WebSocket event
    mockStore.dispatch(setSelectedWorkflowName('test_workflow'));

    render(
      <Providers>
        <GraphElement calibrationGraphKey="test_workflow" calibrationGraph={mockGraph} />
      </Providers>
    );

    await waitFor(() => {
      expect(screen.getByText("Run")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Run"));

    // Verify tab navigation
    await waitFor(() => {
      expect(getActivePage(mockStore.getState())).toBe("graph-status");
    });
  });

  it("should display error on submission failure", async () => {
    const mockError = {
      detail: "Workflow validation failed",
    };
    const mockSubmit = vi.fn().mockResolvedValue({
      isOk: false,
      error: mockError,
    });
    vi.spyOn(GraphLibraryApiModule.GraphLibraryApi, "submitWorkflow").mockImplementation(mockSubmit);

    const { Providers, mockStore } = createTestProviders({
      selection: {
        selectedItemName: "test_workflow",
      },
    });
    //TODO: mock WebSocket event
    mockStore.dispatch(setSelectedWorkflowName('test_workflow'));

    render(
      <Providers>
        <GraphElement calibrationGraphKey="test_workflow" calibrationGraph={mockGraph} />
      </Providers>
    );

    await waitFor(() => {
      expect(screen.getByText("Run")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Run"));

    // Error should be displayed via GraphElementErrorWrapper
    await waitFor(() => {
      expect(screen.getByText(/Workflow validation failed/i)).toBeInTheDocument();
    });
  });

  it("should not submit when workflow name is missing", async () => {
    const mockSubmit = vi.fn().mockResolvedValue({ isOk: true });
    vi.spyOn(GraphLibraryApiModule.GraphLibraryApi, "submitWorkflow").mockImplementation(mockSubmit);

    const { Providers } = createTestProviders({
      selection: {
        selectedItemName: "test_workflow",
      },
    });

    render(
      <Providers>
        <GraphElement calibrationGraphKey="test_workflow" calibrationGraph={mockGraph} />
      </Providers>
    );

    await waitFor(() => {
      expect(screen.getByText("Run")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Run"));

    // API should not be called
    await waitFor(
      () => {
        expect(mockSubmit).not.toHaveBeenCalled();
      },
      { timeout: 500 }
    );
  });
});

describe("GraphElement - UI Interactions", () => {
  const mockGraph = {
    name: "test_workflow",
    description: "Test workflow",
    parameters: {
      frequency: {
        default: 5.0,
        title: "Frequency",
        type: "number",
      },
    },
    nodes: {},
    connectivity: [],
  };

  beforeEach(() => {
    vi.clearAllMocks();

    server.use(
      http.get("/execution/get_graphs", () => {
        return HttpResponse.json({
          test_workflow: mockGraph
        })
      })
    );
  });

  it("should expand when selected", async () => {
    const mockFetch = vi
      .fn()
      .mockResolvedValue({
        isOk: true,
        result: mockGraph,
      });
    vi.spyOn(GraphLibraryApiModule.GraphLibraryApi, "fetchGraph").mockImplementation(mockFetch);

    const { Providers, mockStore } = createTestProviders({
      selection: {
        selectedItemName: undefined, // Initially not selected
      },
    });

    render(
      <Providers>
        <GraphElement calibrationGraphKey="test_workflow" calibrationGraph={mockGraph} />
      </Providers>
    );

    // Initially parameters are collapsed (because show=false)
    // Parameters component uses show prop to control visibility
    const runButton = screen.getByText("Run");
    expect(runButton).toHaveAttribute("disabled");

    // Click to select
    const wrapper = screen.getByText("test_workflow").closest("div");
    fireEvent.click(wrapper!);

    // Verify selection callbacks were called
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith("test_workflow");
      expect(getSelectedWorkflowName(mockStore.getState())).toBe("test_workflow");
    });
  });

  it("should show Cytoscape preview when expanded", async () => {
    const mockElements = [
      { data: { id: "node1" } },
      { data: { id: "node2" } },
    ];

    const { Providers, mockStore } = createTestProviders({
      selection: {
        selectedItemName: "test_workflow",
      },
    });
    //TODO: mock WebSocket event
    mockStore.dispatch(setSelectedWorkflowName('test_workflow'));
    mockStore.dispatch(setWorkflowGraphElements(mockElements));

    render(
      <Providers>
        <GraphElement calibrationGraphKey="test_workflow" calibrationGraph={mockGraph} />
      </Providers>
    );

    // Cytoscape graph should be visible
    await waitFor(() => {
      expect(screen.getByTestId("cytoscape-graph")).toBeInTheDocument();
      expect(screen.getByText(/Cytoscape Graph with 2 elements/i)).toBeInTheDocument();
    });
  });

  it("should fetch workflow graph on selection", async () => {
    const mockFetch = vi
      .fn()
      .mockResolvedValue({
        isOk: true,
        result: mockGraph,
      });
    vi.spyOn(GraphLibraryApiModule.GraphLibraryApi, "fetchGraph").mockImplementation(mockFetch);

    const { Providers } = createTestProviders();

    render(
      <Providers>
        <GraphElement calibrationGraphKey="test_workflow" calibrationGraph={mockGraph} />
      </Providers>
    );

    // Click to select
    const wrapper = screen.getByText("test_workflow").closest("div");
    fireEvent.click(wrapper!);

    // Should call fetchWorkflowGraph
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith("test_workflow");
    });
  });

  it("should highlight when selected via SelectionContext", () => {
    const { Providers, mockStore } = createTestProviders({
      selection: {
        selectedItemName: "test_workflow",
      },
    });
    //TODO: mock WebSocket event
    mockStore.dispatch(setSelectedWorkflowName('test_workflow'));

    const { container } = render(
      <Providers>
        <GraphElement calibrationGraphKey="test_workflow" calibrationGraph={mockGraph} />
      </Providers>
    );

    // Check for calibrationGraphSelected class (CSS modules will hash the name)
    const wrapper = container.querySelector('[class*="calibrationGraphSelected"]');
    expect(wrapper).toBeInTheDocument();
  });
});

describe("GraphElement - Error Handling", () => {
  const mockGraph = {
    name: "test_workflow",
    description: "Test workflow",
    parameters: {
      frequency: {
        default: 5.0,
        title: "Frequency",
        type: "number",
      },
    },
    nodes: {},
    connectivity: [],
  };

  beforeEach(() => {
    vi.clearAllMocks();

    server.use(
      http.get("/execution/get_graphs", () => {
        return HttpResponse.json({
          test_workflow: mockGraph
        })
      })
    );
  });

  it("should show GraphElementErrorWrapper on API error", async () => {
    const mockError = {
      detail: [
        {
          type: "value_error",
          msg: "Invalid parameter value",
        },
      ],
    };
    const mockSubmit = vi.fn().mockResolvedValue({
      isOk: false,
      error: mockError,
    });
    vi.spyOn(GraphLibraryApiModule.GraphLibraryApi, "submitWorkflow").mockImplementation(mockSubmit);

    const { Providers, mockStore } = createTestProviders({
      selection: {
        selectedItemName: "test_workflow",
      },
    });
    //TODO: mock WebSocket event
    mockStore.dispatch(setSelectedWorkflowName('test_workflow'));

    render(
      <Providers>
        <GraphElement calibrationGraphKey="test_workflow" calibrationGraph={mockGraph} />
      </Providers>
    );

    await waitFor(() => {
      expect(screen.getByText("Run")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Run"));

    // Error should be displayed
    await waitFor(() => {
      expect(screen.getByText(/Invalid parameter value/i)).toBeInTheDocument();
    });
  });

  it("should auto-expand error section", async () => {
    const mockError = {
      detail: "Critical workflow error",
    };
    const mockSubmit = vi.fn().mockResolvedValue({
      isOk: false,
      error: mockError,
    });
    vi.spyOn(GraphLibraryApiModule.GraphLibraryApi, "submitWorkflow").mockImplementation(mockSubmit);

    const { Providers, mockStore } = createTestProviders({
      selection: {
        selectedItemName: "test_workflow",
      },
    });
    //TODO: mock WebSocket event
    mockStore.dispatch(setSelectedWorkflowName('test_workflow'));

    render(
      <Providers>
        <GraphElement calibrationGraphKey="test_workflow" calibrationGraph={mockGraph} />
      </Providers>
    );

    await waitFor(() => {
      expect(screen.getByText("Run")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Run"));

    // Error message should be visible (GraphElementErrorWrapper shows error object as JSON)
    await waitFor(() => {
      // The error is displayed as JSON string in GraphElementErrorWrapper
      expect(screen.getByText(/Critical workflow error/i)).toBeInTheDocument();
    });
  });

  it("should clear errors on successful submission", async () => {
    const mockSubmit = vi
      .fn()
      .mockResolvedValueOnce({
        isOk: false,
        error: { detail: "Validation error" },
      })
      .mockResolvedValueOnce({
        isOk: true,
      });
    vi.spyOn(GraphLibraryApiModule.GraphLibraryApi, "submitWorkflow").mockImplementation(mockSubmit);

    const { Providers, mockStore } = createTestProviders({
      selection: {
        selectedItemName: "test_workflow",
      },
    });
    //TODO: mock WebSocket event
    mockStore.dispatch(setSelectedWorkflowName('test_workflow'));

    render(
      <Providers>
        <GraphElement calibrationGraphKey="test_workflow" calibrationGraph={mockGraph} />
      </Providers>
    );

    await waitFor(() => {
      expect(screen.getByText("Run")).toBeInTheDocument();
    });

    // First submission - should show error
    fireEvent.click(screen.getByText("Run"));

    await waitFor(() => {
      expect(screen.getByText(/Validation error/i)).toBeInTheDocument();
    });

    // Verify error is displayed in GraphElementErrorWrapper
    await waitFor(() => {
      expect(mockSubmit).toHaveBeenCalledTimes(1);
      expect(screen.getByText("Error")).toBeInTheDocument();
    });

    // Second submission succeeds - error SHOULD be cleared
    fireEvent.click(screen.getByText("Run"));

    await waitFor(() => {
      expect(mockSubmit).toHaveBeenCalledTimes(2);
    });

    await waitFor(
      () => {
        expect(screen.queryByText(/Validation error/i)).not.toBeInTheDocument();
        expect(screen.queryByText("Error")).not.toBeInTheDocument();
      },
      { timeout: 1000 }
    );
  });
});
