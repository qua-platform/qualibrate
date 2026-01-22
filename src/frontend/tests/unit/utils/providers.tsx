// Test utilities for React component testing
import React, { useEffect } from "react";
import { render, RenderOptions } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { ReactFlowProvider } from "@xyflow/react";
import { rootReducer, useRootDispatch } from "../../../src/stores";
import { setTrackLatest } from "../../../src/stores/GraphStores/GraphStatus";
import { configureStore } from "@reduxjs/toolkit";
import { useInitApp } from "../../../src/modules/AppRoutes";
import { HistoryType, RunStatusType } from "../../../src/stores/WebSocketStore";
import { NodeMap } from "../../../src/modules/Nodes";
import { setSelectedNodeNameInWorkflow } from "../../../src/stores/GraphStores/GraphLibrary";

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
  allNodes?: NodeMap
} = {}) => {
  const preloadedState = {
    nodes: {
      allNodes: overrides.allNodes,
      isNodeRunning: false,
      isAllStatusesUpdated: false,
      updateAllButtonPressed: false,
      isRescanningNodes: false,
    }
  };

  const mockStore = configureStore({ reducer: rootReducer, preloadedState });

  // Helper component to set initial context values
  const ContextSetter = ({ children }: { children: React.ReactNode }) =>  {
    const dispatch = useRootDispatch();

    useInitApp();

    useEffect(() => {
      if (overrides.graph?.selectedNodeNameInWorkflow !== undefined) {
        dispatch(setSelectedNodeNameInWorkflow(overrides.graph.selectedNodeNameInWorkflow));
      }
    }, [setSelectedNodeNameInWorkflow]);

    useEffect(() => {
      if (overrides.graphStatus?.setTrackLatest) {
        // Context provides the function, tests can spy on it
      }
    }, [setTrackLatest]);

    return <>{children}</>;
  };

  const Providers = ({ children }: { children: React.ReactNode }) => {
    return (
    <BrowserRouter>
      <Provider store={mockStore}>
        <ReactFlowProvider>
          <ContextSetter>{children}</ContextSetter>
        </ReactFlowProvider>
      </Provider>
    </BrowserRouter>
    );
  };

  return {
    Providers,
    mockStore
  };
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