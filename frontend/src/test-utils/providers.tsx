// Test utilities for React component testing
import React, { createContext, useEffect } from "react";
import { render, RenderOptions } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { NodesContextProvider } from "../modules/Nodes/context/NodesContext";
import { SelectionContextProvider, useSelectionContext } from "../modules/common/context/SelectionContext";
import { SnapshotsContextProvider } from "../modules/Snapshots/context/SnapshotsContext";
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
 *   selection: { selectedItemName: "test_cal" }
 * });
 * render(<Providers><NodeElement /></Providers>);
 */
export const createTestProviders = (overrides: {
  webSocket?: Partial<MockWebSocketContextValue>;
  selection?: { selectedItemName?: string | null };
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

  // Helper component to set initial selection
  const SelectionSetter: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { setSelectedItemName } = useSelectionContext();

    useEffect(() => {
      if (overrides.selection?.selectedItemName) {
        setSelectedItemName(overrides.selection.selectedItemName);
      }
    }, [setSelectedItemName]);

    return <>{children}</>;
  };

  const TestProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <BrowserRouter>
      <WebSocketContext.Provider value={defaultWebSocketValue}>
        <NodesContextProvider>
          <SelectionContextProvider>
            <SnapshotsContextProvider>
              <SelectionSetter>
                {children}
              </SelectionSetter>
            </SnapshotsContextProvider>
          </SelectionContextProvider>
        </NodesContextProvider>
      </WebSocketContext.Provider>
    </BrowserRouter>
  );

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