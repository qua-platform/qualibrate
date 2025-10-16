// Test utilities for React component testing
import React, { createContext, useEffect } from "react";
import { render, RenderOptions } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { NodesContextProvider } from "../modules/Nodes/context/NodesContext";
import { SelectionContextProvider, useSelectionContext } from "../modules/common/context/SelectionContext";
import { SnapshotsContextProvider } from "../modules/Snapshots/context/SnapshotsContext";
import { GraphContextProvider, useGraphContext } from "../modules/GraphLibrary/context/GraphContext";
import { GraphStatusContextProvider, useGraphStatusContext } from "../modules/GraphLibrary/components/GraphStatus/context/GraphStatusContext";
import type { RunStatusType, HistoryType } from "../contexts/WebSocketContext";

/**
 * Mock WebSocket context value interface
 */
interface MockWebSocketContextValue {
  runStatus: RunStatusType | null;
  history: HistoryType | null;
  sendRunStatus: (data: RunStatusType) => void;
  sendHistory: (data: HistoryType) => void;
  subscribeToRunStatus: (cb: (data: RunStatusType) => void) => () => void;
  subscribeToHistory: (cb: (data: HistoryType) => void) => () => void;
}

/**
 * Mock WebSocket context for testing
 * Export it so tests can use useWebSocketData() hook
 */
export const WebSocketContext = createContext<MockWebSocketContextValue>({
  runStatus: null,
  history: null,
  sendRunStatus: () => {},
  sendHistory: () => {},
  subscribeToRunStatus: () => () => {},
  subscribeToHistory: () => () => {},
});

/**
 * Create test providers with optional context overrides
 *
 * @param overrides - Optional context value overrides for testing specific scenarios
 * @returns Provider component that wraps test components
 *
 * @example
 * const Providers = createTestProviders({
 *   webSocket: { runStatus: { is_running: true, ... } },
 *   selection: { selectedItemName: "test_cal" },
 *   graph: { selectedNodeNameInWorkflow: "node1" }
 * });
 * render(<Providers><NodeElement /></Providers>);
 */
export const createTestProviders = (overrides: {
  webSocket?: Partial<MockWebSocketContextValue>;
  selection?: { selectedItemName?: string | undefined | null; setSelectedItemName?: (name: string | undefined) => void };
  graph?: {
    selectedNodeNameInWorkflow?: string;
    setSelectedNodeNameInWorkflow?: (name: string | undefined) => void;
  };
  graphStatus?: {
    setTrackLatest?: (track: boolean) => void;
  };
} = {}) => {
  const defaultWebSocketValue: MockWebSocketContextValue = {
    runStatus: null,
    history: null,
    sendRunStatus: () => {},
    sendHistory: () => {},
    subscribeToRunStatus: () => () => {},
    subscribeToHistory: () => () => {},
    ...overrides.webSocket,
  };

  // Helper component to set initial context values
  function ContextSetter({ children }: { children: React.ReactNode }): React.ReactElement {
    const { setSelectedItemName } = useSelectionContext();
    const { setSelectedNodeNameInWorkflow } = useGraphContext();
    const { setTrackLatest } = useGraphStatusContext();

    useEffect(() => {
      if (overrides.selection?.selectedItemName !== undefined) {
        setSelectedItemName(overrides.selection.selectedItemName || undefined);
      }
      if (overrides.selection?.setSelectedItemName) {
        // Allow tests to override the setter function
      }
    }, [setSelectedItemName]);

    useEffect(() => {
      if (overrides.graph?.selectedNodeNameInWorkflow !== undefined) {
        setSelectedNodeNameInWorkflow(overrides.graph.selectedNodeNameInWorkflow);
      }
    }, [setSelectedNodeNameInWorkflow]);

    useEffect(() => {
      if (overrides.graphStatus?.setTrackLatest) {
        // Context provides the function, tests can spy on it
      }
    }, [setTrackLatest]);

    return <>{children}</>;
  }

  function TestProviders({ children }: { children: React.ReactNode }): React.ReactElement {
    return (
    <BrowserRouter>
      <WebSocketContext.Provider value={defaultWebSocketValue}>
        {/* @ts-expect-error - GraphContextProvider has incorrect type PropsWithChildren<ReactNode> */}
        <GraphContextProvider>
          <GraphStatusContextProvider>
            <NodesContextProvider>
              <SelectionContextProvider>
                <SnapshotsContextProvider>
                  <ContextSetter>{children}</ContextSetter>
                </SnapshotsContextProvider>
              </SelectionContextProvider>
            </NodesContextProvider>
          </GraphStatusContextProvider>
        </GraphContextProvider>
      </WebSocketContext.Provider>
    </BrowserRouter>
    );
  }

  return TestProviders;
};

/**
 * Minimal mock providers for testing components in isolation
 * Add additional providers as needed for specific test scenarios
 */
const MockedProviders: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => <BrowserRouter>{children}</BrowserRouter>;

/**
 * Custom render function that wraps components with necessary providers
 * Usage: import { render } from '@/test-utils/providers';
 */
const customRender = (ui: React.ReactElement, options?: RenderOptions) =>
  render(ui, { wrapper: MockedProviders, ...options });

// Re-export everything from @testing-library/react
export * from "@testing-library/react";

// Override the default render with our custom one
export { customRender as render };