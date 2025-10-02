// Global test setup file
import "@testing-library/jest-dom";
import "vitest-canvas-mock";
import { beforeAll, afterAll, afterEach, vi } from "vitest";
import { server } from "./mocks/server";

// Mock WebSocket globally
global.WebSocket = vi.fn(() => ({
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  send: vi.fn(),
  close: vi.fn(),
  readyState: 1, // OPEN
  CONNECTING: 0,
  OPEN: 1,
  CLOSING: 2,
  CLOSED: 3,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
})) as any;

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
})) as any;

// Mock ResizeObserver
global.ResizeObserver = vi.fn(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
})) as any;

// Setup MSW server
// Configure to bypass WebSocket URLs (MSW cannot intercept ws:// protocol)
beforeAll(() =>
  server.listen({
    onUnhandledRequest(request, print) {
      // Ignore WebSocket connection attempts
      const url = new URL(request.url);
      if (url.protocol === "ws:" || url.protocol === "wss:") {
        return;
      }

      // Warn about unhandled HTTP requests
      print.warning();
    },
  })
);
afterEach(() => server.resetHandlers());
afterAll(() => server.close());