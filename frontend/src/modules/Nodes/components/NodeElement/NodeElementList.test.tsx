import { describe, it, expect } from "vitest";
import React, { createContext } from "react";
import { render, screen } from "@testing-library/react";
import { NodeElementList } from "./NodeElementList";
import { NodesContextProvider, useNodesContext } from "../../context/NodesContext";
import { SelectionContextProvider } from "../../../common/context/SelectionContext";
import { SnapshotsContextProvider } from "../../../Snapshots/context/SnapshotsContext";
import { BrowserRouter } from "react-router-dom";
import type { RunStatusType, HistoryType } from "../../../../contexts/WebSocketContext";

// Mock WebSocket context
const WebSocketContext = createContext<{
  runStatus: RunStatusType | null;
  history: HistoryType | null;
  sendRunStatus: (data: RunStatusType) => void;
  sendHistory: (data: HistoryType) => void;
  subscribeToRunStatus: (cb: (data: RunStatusType) => void) => () => void;
  subscribeToHistory: (cb: (data: HistoryType) => void) => () => void;
}>({
  runStatus: null,
  history: null,
  sendRunStatus: () => {},
  sendHistory: () => {},
  subscribeToRunStatus: () => () => {},
  subscribeToHistory: () => () => {}
});

// Test wrapper that sets up nodes via context
const TestWrapper = ({ children, nodes }: { children: React.ReactNode; nodes?: Record<string, unknown> }) => {
  return (
    <BrowserRouter>
      <WebSocketContext.Provider
        value={{
          runStatus: null,
          history: null,
          sendRunStatus: () => {},
          sendHistory: () => {},
          subscribeToRunStatus: () => () => {},
          subscribeToHistory: () => () => {}
        }}
      >
        <NodesContextProvider>
          <SelectionContextProvider>
            <SnapshotsContextProvider>
              {nodes && <NodesSetter nodes={nodes} />}
              {children}
            </SnapshotsContextProvider>
          </SelectionContextProvider>
        </NodesContextProvider>
      </WebSocketContext.Provider>
    </BrowserRouter>
  );
};

// Helper component to set nodes in context
const NodesSetter = ({ nodes }: { nodes: Record<string, unknown> }) => {
  const { setAllNodes } = useNodesContext();

  // Set nodes immediately
  React.useEffect(() => {
    setAllNodes(nodes);
  }, [nodes, setAllNodes]);

  return null;
};

describe("NodeElementList", () => {
  it("should render list of nodes when allNodes is populated", () => {
    const mockNodes = {
      test_cal: {
        name: "test_cal",
        title: "Test Calibration",
        description: "Test node",
        parameters: {}
      },
      qubit_spec: {
        name: "qubit_spec",
        title: "Qubit Spectroscopy",
        description: "Qubit node",
        parameters: {}
      }
    };

    render(
      <TestWrapper nodes={mockNodes}>
        <NodeElementList />
      </TestWrapper>
    );

    // Verify the list wrapper is rendered
    expect(screen.getByTestId("node-list-wrapper")).toBeInTheDocument();

    // Verify both nodes are rendered
    expect(screen.getByTestId("node-element-test_cal")).toBeInTheDocument();
    expect(screen.getByTestId("node-element-qubit_spec")).toBeInTheDocument();
  });

  it("should render empty list when nodes object is empty", () => {
    const { container } = render(
      <TestWrapper nodes={{}}>
        <NodeElementList />
      </TestWrapper>
    );

    // List wrapper should still be rendered
    expect(screen.getByTestId("node-list-wrapper")).toBeInTheDocument();

    // No node elements should be present
    const nodeElements = container.querySelectorAll('[data-testid^="node-element-"]');
    expect(nodeElements.length).toBe(0);
  });

  it("should render single node correctly", () => {
    const mockNodes = {
      single_node: {
        name: "single_node",
        title: "Single Node",
        description: "A single test node",
        parameters: {
          param1: {
            default: "value1",
            title: "Parameter 1",
            type: "string"
          }
        }
      }
    };

    render(
      <TestWrapper nodes={mockNodes}>
        <NodeElementList />
      </TestWrapper>
    );

    expect(screen.getByTestId("node-element-single_node")).toBeInTheDocument();
  });
});
