// Global test setup file
import "@testing-library/jest-dom";
import "vitest-canvas-mock";
import { beforeAll, afterAll, afterEach, beforeEach, vi } from "vitest";
import { server } from "./mocks/server";

/**
 * Console Output Suppression Strategy
 *
 * When DEBUG_TESTS=false (default for npm test):
 * - console.error() and console.warn() → Always shown immediately (real errors)
 * - console.log(), console.debug(), console.info() → Buffered, shown only if test fails
 * - stderr output → Buffered, shown only if test fails
 *
 * This ensures:
 * 1. Real errors/warnings are ALWAYS visible (even when tests pass)
 * 2. Clean output without debug noise when tests pass
 * 3. Full diagnostic output when tests fail
 *
 * When DEBUG_TESTS=true (npm run test:unit:debug):
 * - All console output shown immediately in real-time
 * - Use this for deep debugging of test behavior
 */

const DEBUG_TESTS = process.env.DEBUG_TESTS !== "false";  // Default is true

// Signal to vitest.config.ts that tests are running
(globalThis as unknown as { __vitest_tests_running__: boolean }).__vitest_tests_running__ = true;

// Store original console methods and stderr
const originalConsole = {
  log: console.log.bind(console),
  debug: console.debug.bind(console),
  info: console.info.bind(console),
  warn: console.warn.bind(console),
  error: console.error.bind(console),
};
const originalStderrWrite = process.stderr.write.bind(process.stderr);

// Buffers for capturing output during each test
let consoleBuffer: Array<{ type: keyof typeof originalConsole; args: unknown[] }> = [];
let stderrBuffer: string[] = [];

if (!DEBUG_TESTS) {
  // Create buffering console methods for non-critical output
  const createBufferingConsole = (type: keyof typeof originalConsole) => {
    return (...args: unknown[]) => {
      consoleBuffer.push({ type, args });
    };
  };

  // Create pass-through methods for critical output (errors/warnings)
  const createPassThroughConsole = (type: keyof typeof originalConsole) => {
    return (...args: unknown[]) => {
      // Always show immediately
      originalConsole[type](...args);
      // Also buffer for "Test Failed" summary if test fails
      consoleBuffer.push({ type, args });
    };
  };

  // Replace console methods:
  // - error/warn → pass through (always visible)
  // - log/debug/info → buffered (shown only on test failure)
  global.console = {
    ...console,
    log: createBufferingConsole("log") as typeof console.log,
    debug: createBufferingConsole("debug") as typeof console.debug,
    info: createBufferingConsole("info") as typeof console.info,
    warn: createPassThroughConsole("warn") as typeof console.warn,
    error: createPassThroughConsole("error") as typeof console.error,
  };

  // Override stderr.write to buffer ALL stderr output (including React errors)
  // This will be printed only if the test fails
  process.stderr.write = ((chunk: string | Uint8Array) => {
    const text = typeof chunk === "string" ? chunk : chunk.toString();
    stderrBuffer.push(text);
    // Return true to indicate success (required by Node.js stream API)
    return true;
  }) as typeof process.stderr.write;
}

// Clear buffers before each test
beforeEach(() => {
  consoleBuffer = [];
  stderrBuffer = [];
});

// After each test, print buffered output only if test failed
afterEach(async (context: { task?: { result?: { state?: string; errors?: unknown[] } } }) => {
  if (DEBUG_TESTS) {
    return; // In debug mode, output already appeared in real-time
  }

  // Wait a tick to ensure test state is updated
  await new Promise(resolve => setTimeout(resolve, 0));

  // Check if test failed
  const testFailed =
    context?.task?.result?.state === "fail" ||
    (context?.task?.result?.errors && context.task.result.errors.length > 0);

  if (testFailed) {
    // Print only buffered console output (log/debug/info)
    // Don't re-print warn/error since they were already shown
    const bufferedOnlyOutput = consoleBuffer.filter(
      ({ type }) => type === "log" || type === "debug" || type === "info"
    );

    if (bufferedOnlyOutput.length > 0) {
      originalConsole.log("\n━━━ Console Output (Test Failed) ━━━");
      bufferedOnlyOutput.forEach(({ type, args }) => {
        originalConsole[type](...args);
      });
    }

    // Print buffered stderr
    if (stderrBuffer.length > 0) {
      originalConsole.log("\n━━━ Stderr Output (Test Failed) ━━━");
      stderrBuffer.forEach((chunk) => {
        originalStderrWrite(chunk);
      });
    }

    if (bufferedOnlyOutput.length > 0 || stderrBuffer.length > 0) {
      originalConsole.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
    }
  }

  // Clear buffers for next test
  consoleBuffer = [];
  stderrBuffer = [];
});

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
// Configure to bypass WebSocket URLs and silence warnings for unhandled requests
beforeAll(() =>
  server.listen({
    onUnhandledRequest(request) {
      // Ignore WebSocket connection attempts
      const url = new URL(request.url);
      if (url.protocol === "ws:" || url.protocol === "wss:") {
        return;
      }

      // Silence warnings about unhandled HTTP requests in tests
      // We don't need to mock every endpoint, only the ones that matter for our tests
    },
  })
);
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});