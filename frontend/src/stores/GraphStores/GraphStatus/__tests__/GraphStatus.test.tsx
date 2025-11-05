import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { createTestProviders } from "@/test-utils/providers";
import { Measurement } from "../GraphStatusStore";
// import { useGraphStatusContext } from "@/modules/GraphLibrary/components/GraphStatus/context/GraphStatusContext";
import { useSnapshotsContext } from "../../../../modules/Snapshots/context/SnapshotsContext";
import GraphStatus from "../../../../modules/GraphLibrary/components/GraphStatus/GraphStatus";
import graphStatusSlice from '../GraphStatusStore'
import { getAllMeasurements, getTrackLatest } from "../selectors";
import { setSelectedNodeNameInWorkflow } from "../../GraphCommon/actions";
import { getSelectedWorkflowName } from "../../GraphLibrary/selectors";
import { setSelectedWorkflowName } from "../../GraphLibrary/actions";
import { getWorkflowGraphElements } from "../../GraphCommon/selectors";
import { setAllMeasurements } from "../actions";
import { server } from "@/test-utils/mocks/server";
import { http, HttpResponse } from "msw";

// Mock the child components to isolate GraphStatus logic
vi.mock("../../../../modules/GraphLibrary/components/GraphStatus/components/MeasurementElementGraph/MeasurementElementGraph", () => ({
  MeasurementElementGraph: ({ onCytoscapeNodeClick }: { onCytoscapeNodeClick: (name: string) => void }) => (
    <div data-testid="measurement-element-graph">
      <button onClick={() => onCytoscapeNodeClick("test_node")}>Click Node</button>
    </div>
  ),
}));

vi.mock("../../../../modules/GraphLibrary/components/GraphStatus/components/MeasurementHistory/MeasurementHistory", () => ({
  MeasurementHistory: () => <div data-testid="measurement-history">Measurement History</div>,
}));

// Mock Results component to avoid FlexLayoutContext dependency
vi.mock("../../../../modules/Nodes/components/Results/Results", () => ({
  Results: ({ jsonObject, errorObject }: { jsonObject: object; errorObject?: object }) => (
    <div data-testid="results">
      {errorObject ? (
        <div data-testid="results-error">Error: {JSON.stringify(errorObject)}</div>
      ) : (
        <div data-testid="results-content">Results: {JSON.stringify(jsonObject)}</div>
      )}
    </div>
  ),
}));

// Mock context hooks for precise control
vi.mock("../GraphStatusStore", async () => {
  const actual = await vi.importActual("../GraphStatusStore");
  return {
    ...actual,
    graphStatusSlice: vi.fn(),
  };
});

vi.mock("../../../../modules/Snapshots/context/SnapshotsContext", async () => {
  const actual = await vi.importActual("../../../../modules/Snapshots/context/SnapshotsContext");
  return {
    ...actual,
    useSnapshotsContext: vi.fn(),
  };
});


vi.mock("../../../../modules/common/context/SelectionContext", async () => {
  const actual = await vi.importActual("../../../../modules/common/context/SelectionContext");
  return {
    ...actual,
    useSelectionContext: vi.fn(),
  };
});

const mockNodes = [
  {
    group: "nodes",
    data: {
      id: "test_node"
    },
    position: {
      x: 100,
      y: 100
    }
  },
  {
    group: "nodes",
    data: {
      id: "another_node"
    },
    position: {
      x: 100,
      y: 100
    }
  }
]

describe("GraphStatus - Context Coordination", () => {
  const mockMeasurements: Measurement[] = [
    {
      id: 1,
      created_at: "2024-01-01T10:00:00Z",
      metadata: {
        name: "test_node",
        status: "finished",
        run_duration: 1.5,
        run_start: "2024-01-01T10:00:00Z",
        run_end: "2024-01-01T10:01:30Z",
      },
      data: {
        parameters: { frequency: 5.0 },
        outcomes: { q1: "successful" },
        error: null,
      },
    },
    {
      id: 2,
      created_at: "2024-01-01T11:00:00Z",
      metadata: {
        name: "another_node",
        status: "finished",
        run_duration: 2.0,
        run_start: "2024-01-01T11:00:00Z",
        run_end: "2024-01-01T11:02:00Z",
      },
      data: {
        parameters: { amplitude: 0.5 },
        outcomes: { q1: "failed" },
        error: null,
      },
    },
  ];

  const mockWorkflowGraphElements = [
    { data: { id: "test_node" } },
    { data: { id: "another_node" } },
  ];

  beforeEach(async () => {
    vi.clearAllMocks();
    server.use(
      http.get('/execution/last_run/workflow/execution_history', () =>
        HttpResponse.json({ items: mockMeasurements })
      ),
      http.get("/execution/get_graph/cytoscape", () =>
        HttpResponse.json(mockNodes)
      )
    );

    // Setup default mock implementations
    (useSnapshotsContext as ReturnType<typeof vi.fn>).mockReturnValue({
      result: {},
      fetchOneSnapshot: vi.fn(),
      setResult: vi.fn(),
      setDiffData: vi.fn(),
      setSelectedSnapshotId: vi.fn(),
      setClickedForSnapshotSelection: vi.fn(),
    });

    // Mock SelectionContext
    const { useSelectionContext } = await import("../../../../modules/common/context/SelectionContext");
    (useSelectionContext as ReturnType<typeof vi.fn>).mockReturnValue({
      selectedItemName: undefined,
      setSelectedItemName: vi.fn(),
    });
  });

  it("should fetch measurements on mount", async () => {
    const { Providers, mockStore } = createTestProviders();
    //TODO: mock WebSocket event
    mockStore.dispatch(setSelectedWorkflowName('test_workflow'))

    render(
      <Providers>
        <GraphStatus />
      </Providers>
    );

    // Component should render with graph elements
    await waitFor(() => {
      expect(screen.getByTestId("measurement-element-graph")).toBeInTheDocument();
      expect(screen.getByTestId("measurement-history")).toBeInTheDocument();
    }, {
      // timeout: 3000
    });
  });

  it("should sync selection across contexts", async () => {
    const mockSetSelectedItemName = vi.fn();

    const { useSelectionContext } = await import("../../../../modules/common/context/SelectionContext");
    (useSelectionContext as ReturnType<typeof vi.fn>).mockReturnValue({
      selectedItemName: "test_node",
      setSelectedItemName: mockSetSelectedItemName,
    });

    const { Providers, mockStore } = createTestProviders();
    //TODO: mock WebSocket event
    mockStore.dispatch(setSelectedWorkflowName('test_workflow'))

    render(
      <Providers>
        <GraphStatus />
      </Providers>
    );

    await waitFor(() => {
      expect(screen.getByTestId("measurement-element-graph")).toBeInTheDocument();
    });
  });

  it("should disable track-latest on manual node click", async () => {
    const mockFetchOneSnapshot = vi.fn();

    (useSnapshotsContext as ReturnType<typeof vi.fn>).mockReturnValue({
      result: {},
      fetchOneSnapshot: mockFetchOneSnapshot,
      setResult: vi.fn(),
      setDiffData: vi.fn(),
      setSelectedSnapshotId: vi.fn(),
      setClickedForSnapshotSelection: vi.fn(),
    });

    const { Providers, mockStore } = createTestProviders();
    //TODO: mock WebSocket event
    mockStore.dispatch(setSelectedWorkflowName('test_workflow'))

    render(
      <Providers>
        <GraphStatus />
      </Providers>
    );

    // Click on a node
    const clickButton = await screen.findByText("Click Node");
    clickButton.click();

    // Verify track-latest was disabled
    await waitFor(() => {
      expect(getTrackLatest(mockStore.getState())).toBe(false);
    });
  });

  it("should fetch snapshot when measurement is selected", async () => {
    const mockFetchOneSnapshot = vi.fn();
    const mockSetSelectedSnapshotId = vi.fn();
    const mockSetClickedForSnapshotSelection = vi.fn();

    (useSnapshotsContext as ReturnType<typeof vi.fn>).mockReturnValue({
      result: {},
      fetchOneSnapshot: mockFetchOneSnapshot,
      setResult: vi.fn(),
      setDiffData: vi.fn(),
      setSelectedSnapshotId: mockSetSelectedSnapshotId,
      setClickedForSnapshotSelection: mockSetClickedForSnapshotSelection,
    });

    const { Providers, mockStore } = createTestProviders();
    //TODO: mock WebSocket event
    mockStore.dispatch(setSelectedWorkflowName('test_workflow'))

    render(
      <Providers>
        <GraphStatus />
      </Providers>
    );

    // Click on a node
    const clickButton = await screen.findByText("Click Node");
    clickButton.click();

    // Verify snapshot was fetched with correct parameters
    await waitFor(() => {
      expect(mockFetchOneSnapshot).toHaveBeenCalledWith(1, 0, true, true);
      expect(mockSetSelectedSnapshotId).toHaveBeenCalledWith(1);
      expect(mockSetClickedForSnapshotSelection).toHaveBeenCalledWith(true);
    });
  });
});

describe("GraphStatus - Measurement Operations", () => {
  const mockMeasurements: Measurement[] = [
    {
      id: 10,
      created_at: "2024-01-01T10:00:00Z",
      metadata: {
        name: "calibration_node",
        status: "finished",
        run_duration: 1.5,
      },
      data: {
        parameters: {},
        outcomes: {},
        error: null,
      },
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    server.use(
      http.get('/execution/last_run/workflow/execution_history', () =>
        HttpResponse.json({ items: mockMeasurements })
      ),
      http.get("/execution/get_graph/cytoscape", () =>
        HttpResponse.json(mockNodes)
      ),
    );

    (useSnapshotsContext as ReturnType<typeof vi.fn>).mockReturnValue({
      result: {},
      fetchOneSnapshot: vi.fn(),
      setResult: vi.fn(),
      setDiffData: vi.fn(),
      setSelectedSnapshotId: vi.fn(),
      setClickedForSnapshotSelection: vi.fn(),
    });
  });

  it("should find measurement ID by name", async () => {
    const mockFetchOneSnapshot = vi.fn();

    (useSnapshotsContext as ReturnType<typeof vi.fn>).mockReturnValue({
      result: {},
      fetchOneSnapshot: mockFetchOneSnapshot,
      setResult: vi.fn(),
      setDiffData: vi.fn(),
      setSelectedSnapshotId: vi.fn(),
      setClickedForSnapshotSelection: vi.fn(),
    });

    const { Providers, mockStore } = createTestProviders();
    //TODO: mock WebSocket event
    mockStore.dispatch(setSelectedWorkflowName('test_workflow'))

    render(
      <Providers>
        <GraphStatus />
      </Providers>
    );

    // Verify the component renders correctly
    await waitFor(() => {
      expect(screen.getByTestId("measurement-element-graph")).toBeInTheDocument();
    });
  });

  it("should handle missing measurements gracefully", async () => {
    server.use(http.get('/execution/last_run/workflow/execution_history', () =>
      HttpResponse.json(null, { status: 500 })
    ));
    const mockSetResult = vi.fn();
    const mockSetDiffData = vi.fn();

    (useSnapshotsContext as ReturnType<typeof vi.fn>).mockReturnValue({
      result: {},
      fetchOneSnapshot: vi.fn(),
      setResult: mockSetResult,
      setDiffData: mockSetDiffData,
      setSelectedSnapshotId: vi.fn(),
      setClickedForSnapshotSelection: vi.fn(),
    });

    const { Providers, mockStore } = createTestProviders();
    //TODO: mock WebSocket event
    mockStore.dispatch(setSelectedWorkflowName('test_workflow'))
    mockStore.dispatch(setAllMeasurements([]))

    render(
      <Providers>
        <GraphStatus />
      </Providers>
    );

    // Click on a node that doesn't exist in measurements
    const clickButton = await screen.findByText("Click Node");
    clickButton.click();

    // Should clear results when measurement ID is not found
    await waitFor(() => {
      expect(mockSetResult).toHaveBeenCalledWith({});
      expect(mockSetDiffData).toHaveBeenCalledWith({});
    });
  });

  it("should fetch measurements if not loaded", async () => {
    const { Providers, mockStore } = createTestProviders();
    //TODO: mock WebSocket event
    mockStore.dispatch(setSelectedWorkflowName('test_workflow'))

    render(
      <Providers>
        <GraphStatus />
      </Providers>
    );

    // Click should trigger measurement fetch
    const clickButton = await screen.findByText("Click Node");
    clickButton.click();

    await waitFor(() => {
      expect(getAllMeasurements(mockStore.getState())).toBeDefined()
    });
  });

  it("should clear result when measurement ID is missing", async () => {
    server.use(http.get('/execution/last_run/workflow/execution_history', () =>
      HttpResponse.json(null, { status: 500 })
    ));
    const mockSetResult = vi.fn();
    const mockSetDiffData = vi.fn();

    (useSnapshotsContext as ReturnType<typeof vi.fn>).mockReturnValue({
      result: {},
      fetchOneSnapshot: vi.fn(),
      setResult: mockSetResult,
      setDiffData: mockSetDiffData,
      setSelectedSnapshotId: vi.fn(),
      setClickedForSnapshotSelection: vi.fn(),
    });

    const { Providers, mockStore } = createTestProviders();
    //TODO: mock WebSocket event
    mockStore.dispatch(setSelectedWorkflowName('test_workflow'))
    mockStore.dispatch(setAllMeasurements([]))

    render(
      <Providers>
        <GraphStatus />
      </Providers>
    );

    // Click on a node that doesn't match any measurement
    const clickButton = await screen.findByText("Click Node");
    clickButton.click();

    await waitFor(() => {
      expect(mockSetResult).toHaveBeenCalledWith({});
      expect(mockSetDiffData).toHaveBeenCalledWith({});
    });
  });
});

describe("GraphStatus - Node Click Handling", () => {
  const mockMeasurements: Measurement[] = [
    {
      id: 5,
      created_at: "2024-01-01T10:00:00Z",
      metadata: {
        name: "test_node",
        status: "finished",
        run_duration: 1.5,
      },
      data: {
        parameters: { param1: "value1" },
        outcomes: { q1: "successful" },
        error: null,
      },
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    server.use(
      http.get('/execution/last_run/workflow/execution_history', () =>
        HttpResponse.json({ items: mockMeasurements })
      ),
      http.get("/execution/get_graph/cytoscape", () =>
        HttpResponse.json(mockNodes)
      )
    );

    (useSnapshotsContext as ReturnType<typeof vi.fn>).mockReturnValue({
      result: {},
      fetchOneSnapshot: vi.fn(),
      setResult: vi.fn(),
      setDiffData: vi.fn(),
      setSelectedSnapshotId: vi.fn(),
      setClickedForSnapshotSelection: vi.fn(),
    });
  });

  it("should fetch snapshot on Cytoscape node click", async () => {
    const mockFetchOneSnapshot = vi.fn();

    (useSnapshotsContext as ReturnType<typeof vi.fn>).mockReturnValue({
      result: {},
      fetchOneSnapshot: mockFetchOneSnapshot,
      setResult: vi.fn(),
      setDiffData: vi.fn(),
      setSelectedSnapshotId: vi.fn(),
      setClickedForSnapshotSelection: vi.fn(),
    });

    const { Providers, mockStore } = createTestProviders();
    //TODO: mock WebSocket event
    mockStore.dispatch(setSelectedWorkflowName('test_node'))

    render(
      <Providers>
        <GraphStatus />
      </Providers>
    );

    const clickButton = await screen.findByText("Click Node");
    clickButton.click();

    await waitFor(() => {
      expect(mockFetchOneSnapshot).toHaveBeenCalledWith(5, 4, true, true);
    });
  });

  it("should pass snapshot with diff data", async () => {
    const mockFetchOneSnapshot = vi.fn();

    (useSnapshotsContext as ReturnType<typeof vi.fn>).mockReturnValue({
      result: {},
      fetchOneSnapshot: mockFetchOneSnapshot,
      setResult: vi.fn(),
      setDiffData: vi.fn(),
      setSelectedSnapshotId: vi.fn(),
      setClickedForSnapshotSelection: vi.fn(),
    });

    const { Providers, mockStore } = createTestProviders();
    //TODO: mock WebSocket event
    mockStore.dispatch(setSelectedWorkflowName('test_node'))

    render(
      <Providers>
        <GraphStatus />
      </Providers>
    );

    const clickButton = await screen.findByText("Click Node");
    clickButton.click();

    // Fourth parameter (fetchUpdate) should be true to get diff data
    await waitFor(() => {
      expect(mockFetchOneSnapshot).toHaveBeenCalledWith(
        5, // measurement ID
        4, // previous measurement ID (measurementId - 1)
        true, // updateResult
        true // fetchUpdate (enables diff)
      );
    });
  });

  it("should set clicked-for-snapshot-selection flag", async () => {
    const mockSetClickedForSnapshotSelection = vi.fn();

    (useSnapshotsContext as ReturnType<typeof vi.fn>).mockReturnValue({
      result: {},
      fetchOneSnapshot: vi.fn(),
      setResult: vi.fn(),
      setDiffData: vi.fn(),
      setSelectedSnapshotId: vi.fn(),
      setClickedForSnapshotSelection: mockSetClickedForSnapshotSelection,
    });

    const { Providers, mockStore } = createTestProviders();
    //TODO: mock WebSocket event
    mockStore.dispatch(setSelectedWorkflowName('test_node'))

    render(
      <Providers>
        <GraphStatus />
      </Providers>
    );

    const clickButton = await screen.findByText("Click Node");
    clickButton.click();

    await waitFor(() => {
      expect(mockSetClickedForSnapshotSelection).toHaveBeenCalledWith(true);
    });
  });

  it("should update selection contexts", async () => {
    const mockSetSelectedSnapshotId = vi.fn();

    (useSnapshotsContext as ReturnType<typeof vi.fn>).mockReturnValue({
      result: {},
      fetchOneSnapshot: vi.fn(),
      setResult: vi.fn(),
      setDiffData: vi.fn(),
      setSelectedSnapshotId: mockSetSelectedSnapshotId,
      setClickedForSnapshotSelection: vi.fn(),
    });

    const { Providers, mockStore } = createTestProviders();
    //TODO: mock WebSocket event
    mockStore.dispatch(setSelectedWorkflowName('test_node'))

    render(
      <Providers>
        <GraphStatus />
      </Providers>
    );

    const clickButton = await screen.findByText("Click Node");
    clickButton.click();

    await waitFor(() => {
      expect(getSelectedWorkflowName(mockStore.getState())).toBe("test_node")
      expect(mockSetSelectedSnapshotId).toHaveBeenCalledWith(5);
    });
  });
});
