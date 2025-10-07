/**
 * @fileoverview Unit tests for WebSocketService
 *
 * These tests document and verify the current behavior of WebSocketService,
 * including its known fragilities and limitations. The tests serve as:
 * 1. Safety net for future refactoring
 * 2. Documentation of current behavior including edge cases
 * 3. Baseline for regression testing during improvements
 *
 * **Test Coverage**:
 * - Constructor and initialization
 * - Connection lifecycle (connect, disconnect, reconnect)
 * - Message handling and parsing
 * - Subscriber management (subscribe, unsubscribe)
 * - Current fragilities (linear backoff, retry exhaustion, error propagation)
 * - Edge cases and error scenarios
 *
 * **Testing Approach**:
 * - Mock WebSocket API using vi.fn() for full control
 * - Use fake timers to test reconnection delays
 * - Test names explicitly identify limitations (e.g., "linear backoff")
 *
 * @see WebSocketService.ts for implementation being tested
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import WebSocketService from "../WebSocketService";

describe("WebSocketService - Current Implementation", () => {
  // Mock WebSocket instance that we can control
  let mockWebSocket: {
    onopen: (() => void) | null;
    onmessage: ((event: MessageEvent) => void) | null;
    onerror: ((error: Event) => void) | null;
    onclose: (() => void) | null;
    send: ReturnType<typeof vi.fn>;
    close: ReturnType<typeof vi.fn>;
    readyState: number;
    CONNECTING: number;
    OPEN: number;
    CLOSING: number;
    CLOSED: number;
  };

  // Track WebSocket constructor calls
  let WebSocketConstructorSpy: ReturnType<typeof vi.fn>;

  // Test callback functions
  let onMessageCallback: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    // Reset timers to use fake timers for testing delays
    vi.useFakeTimers();

    // Create mock WebSocket instance
    mockWebSocket = {
      onopen: null,
      onmessage: null,
      onerror: null,
      onclose: null,
      send: vi.fn(),
      close: vi.fn(),
      readyState: 0, // CONNECTING
      CONNECTING: 0,
      OPEN: 1,
      CLOSING: 2,
      CLOSED: 3,
    };

    // Spy on WebSocket constructor and return our mock
    WebSocketConstructorSpy = vi.fn(() => mockWebSocket);

    // Add static properties to the constructor function
    WebSocketConstructorSpy.CONNECTING = 0;
    WebSocketConstructorSpy.OPEN = 1;
    WebSocketConstructorSpy.CLOSING = 2;
    WebSocketConstructorSpy.CLOSED = 3;

    // Use vi.stubGlobal to properly stub the WebSocket global
    vi.stubGlobal("WebSocket", WebSocketConstructorSpy);

    // Create test callback
    onMessageCallback = vi.fn();

    // Suppress console warnings during tests
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "warn").mockImplementation(() => {});
  });

  afterEach(() => {
    // Restore real timers
    vi.useRealTimers();

    // Restore all mocks including stubbed globals
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  /**
   * ========================================================================
   * TEST GROUP 1: Constructor and Initialization
   * ========================================================================
   */
  describe("Constructor and Initialization", () => {
    it("should construct with URL and callback without auto-connecting", () => {
      const url = "ws://localhost:8001/test";
      const service = new WebSocketService(url, onMessageCallback);

      // Should NOT automatically connect
      expect(WebSocketConstructorSpy).not.toHaveBeenCalled();

      // Service should exist and be ready to connect
      expect(service).toBeDefined();
      expect(service.isOpen()).toBe(false);
    });

    it("should accept generic type for type-safe messages", () => {
      interface TestMessage {
        type: string;
        payload: number;
      }

      const typedCallback = vi.fn<[TestMessage], void>();
      const service = new WebSocketService<TestMessage>(
        "ws://localhost:8001/test",
        typedCallback
      );

      // TypeScript compilation ensures type safety
      // Runtime behavior is same as non-generic version
      expect(service).toBeDefined();
    });
  });

  /**
   * ========================================================================
   * TEST GROUP 2: Connection Lifecycle
   * ========================================================================
   */
  describe("Connection Lifecycle", () => {
    it("should create WebSocket instance when connect() is called", () => {
      const url = "ws://localhost:8001/test";
      const service = new WebSocketService(url, onMessageCallback);

      service.connect();

      expect(WebSocketConstructorSpy).toHaveBeenCalledWith(url);
      expect(WebSocketConstructorSpy).toHaveBeenCalledTimes(1);
    });

    it("should set isConnected=true when connection opens", () => {
      const service = new WebSocketService(
        "ws://localhost:8001/test",
        onMessageCallback
      );

      service.connect();
      expect(service.isOpen()).toBe(false); // Not yet open

      // Simulate connection open
      mockWebSocket.readyState = mockWebSocket.OPEN;
      mockWebSocket.onopen?.();

      expect(service.isOpen()).toBe(true);
    });

    it("should prevent duplicate connections (early return if already connected)", () => {
      const service = new WebSocketService(
        "ws://localhost:8001/test",
        onMessageCallback
      );

      service.connect();
      mockWebSocket.onopen?.(); // Open first connection

      service.connect(); // Try to connect again

      // Should only construct WebSocket once
      expect(WebSocketConstructorSpy).toHaveBeenCalledTimes(1);
    });

    it("should disconnect and clean up WebSocket instance", () => {
      const service = new WebSocketService(
        "ws://localhost:8001/test",
        onMessageCallback
      );

      service.connect();
      mockWebSocket.onopen?.();
      expect(service.isOpen()).toBe(true);

      service.disconnect();

      expect(mockWebSocket.close).toHaveBeenCalled();
      expect(service.isOpen()).toBe(false);
    });

    it("should handle disconnect when already disconnected (safe no-op)", () => {
      const service = new WebSocketService(
        "ws://localhost:8001/test",
        onMessageCallback
      );

      // Disconnect without ever connecting
      expect(() => service.disconnect()).not.toThrow();
      expect(service.isOpen()).toBe(false);
    });

    it("should handle WebSocket constructor errors gracefully", () => {
      WebSocketConstructorSpy.mockImplementationOnce(() => {
        throw new Error("Invalid WebSocket URL");
      });

      const service = new WebSocketService(
        "ws://invalid-url",
        onMessageCallback
      );

      // Should not throw, just log error
      expect(() => service.connect()).not.toThrow();
      expect(service.isOpen()).toBe(false);
    });
  });

  /**
   * ========================================================================
   * TEST GROUP 3: Message Handling
   * ========================================================================
   */
  describe("Message Handling", () => {
    it("should parse JSON messages and call onMessage callback", () => {
      const service = new WebSocketService(
        "ws://localhost:8001/test",
        onMessageCallback
      );

      service.connect();
      mockWebSocket.onopen?.();

      // Simulate incoming message
      const testMessage = { type: "status", value: 42 };
      const messageEvent = new MessageEvent("message", {
        data: JSON.stringify(testMessage),
      });

      mockWebSocket.onmessage?.(messageEvent);

      expect(onMessageCallback).toHaveBeenCalledWith(testMessage);
      expect(onMessageCallback).toHaveBeenCalledTimes(1);
    });

    it("should handle invalid JSON gracefully (log warning, no crash)", () => {
      const service = new WebSocketService(
        "ws://localhost:8001/test",
        onMessageCallback
      );

      service.connect();
      mockWebSocket.onopen?.();

      // Send invalid JSON
      const messageEvent = new MessageEvent("message", {
        data: "not valid json {",
      });

      // Should not throw
      expect(() => mockWebSocket.onmessage?.(messageEvent)).not.toThrow();

      // Callback should not be called for invalid JSON
      expect(onMessageCallback).not.toHaveBeenCalled();
    });

    it("should handle complex nested JSON objects", () => {
      const service = new WebSocketService(
        "ws://localhost:8001/test",
        onMessageCallback
      );

      service.connect();
      mockWebSocket.onopen?.();

      // Complex nested message
      const complexMessage = {
        type: "node_status",
        data: {
          node: { id: "123", name: "calibration_node" },
          status: { state: "running", progress: 0.75 },
          results: [1, 2, 3, { nested: true }],
        },
      };

      const messageEvent = new MessageEvent("message", {
        data: JSON.stringify(complexMessage),
      });

      mockWebSocket.onmessage?.(messageEvent);

      expect(onMessageCallback).toHaveBeenCalledWith(complexMessage);
    });
  });

  /**
   * ========================================================================
   * TEST GROUP 4: Subscriber Management (Pub/Sub Pattern)
   * ========================================================================
   */
  describe("Subscriber Management", () => {
    it("should notify subscribers after onMessage callback", () => {
      const service = new WebSocketService(
        "ws://localhost:8001/test",
        onMessageCallback
      );

      const subscriber1 = vi.fn();
      const subscriber2 = vi.fn();

      service.subscribe(subscriber1);
      service.subscribe(subscriber2);

      service.connect();
      mockWebSocket.onopen?.();

      const testMessage = { type: "test" };
      const messageEvent = new MessageEvent("message", {
        data: JSON.stringify(testMessage),
      });

      mockWebSocket.onmessage?.(messageEvent);

      // All callbacks should be called
      expect(onMessageCallback).toHaveBeenCalledWith(testMessage);
      expect(subscriber1).toHaveBeenCalledWith(testMessage);
      expect(subscriber2).toHaveBeenCalledWith(testMessage);
    });

    it("should maintain subscriber order (FIFO)", () => {
      const service = new WebSocketService(
        "ws://localhost:8001/test",
        onMessageCallback
      );

      const callOrder: number[] = [];
      const subscriber1 = vi.fn(() => callOrder.push(1));
      const subscriber2 = vi.fn(() => callOrder.push(2));
      const subscriber3 = vi.fn(() => callOrder.push(3));

      service.subscribe(subscriber1);
      service.subscribe(subscriber2);
      service.subscribe(subscriber3);

      service.connect();
      mockWebSocket.onopen?.();

      const messageEvent = new MessageEvent("message", {
        data: JSON.stringify({ test: true }),
      });

      mockWebSocket.onmessage?.(messageEvent);

      expect(callOrder).toEqual([1, 2, 3]);
    });

    it("should unsubscribe callback by reference", () => {
      const service = new WebSocketService(
        "ws://localhost:8001/test",
        onMessageCallback
      );

      const subscriber1 = vi.fn();
      const subscriber2 = vi.fn();

      service.subscribe(subscriber1);
      service.subscribe(subscriber2);
      service.unsubscribe(subscriber1);

      service.connect();
      mockWebSocket.onopen?.();

      const messageEvent = new MessageEvent("message", {
        data: JSON.stringify({ test: true }),
      });

      mockWebSocket.onmessage?.(messageEvent);

      expect(subscriber1).not.toHaveBeenCalled();
      expect(subscriber2).toHaveBeenCalled();
    });

    it("should safely handle unsubscribe of non-existent callback", () => {
      const service = new WebSocketService(
        "ws://localhost:8001/test",
        onMessageCallback
      );

      const subscriber = vi.fn();
      const neverSubscribed = vi.fn();

      service.subscribe(subscriber);

      // Unsubscribe callback that was never subscribed
      expect(() => service.unsubscribe(neverSubscribed)).not.toThrow();

      service.connect();
      mockWebSocket.onopen?.();

      const messageEvent = new MessageEvent("message", {
        data: JSON.stringify({ test: true }),
      });

      mockWebSocket.onmessage?.(messageEvent);

      // Original subscriber should still work
      expect(subscriber).toHaveBeenCalled();
    });

    it("should allow duplicate subscriptions (current limitation)", () => {
      const service = new WebSocketService(
        "ws://localhost:8001/test",
        onMessageCallback
      );

      const subscriber = vi.fn();

      // FRAGILE: Same callback can be subscribed multiple times
      service.subscribe(subscriber);
      service.subscribe(subscriber);

      service.connect();
      mockWebSocket.onopen?.();

      const messageEvent = new MessageEvent("message", {
        data: JSON.stringify({ test: true }),
      });

      mockWebSocket.onmessage?.(messageEvent);

      // CURRENT BEHAVIOR: Called twice because subscribed twice
      expect(subscriber).toHaveBeenCalledTimes(2);
    });

    it("should remove all instances when unsubscribing duplicates", () => {
      const service = new WebSocketService(
        "ws://localhost:8001/test",
        onMessageCallback
      );

      const subscriber = vi.fn();

      service.subscribe(subscriber);
      service.subscribe(subscriber);
      service.subscribe(subscriber);

      // Unsubscribe once removes ALL instances
      service.unsubscribe(subscriber);

      service.connect();
      mockWebSocket.onopen?.();

      const messageEvent = new MessageEvent("message", {
        data: JSON.stringify({ test: true }),
      });

      mockWebSocket.onmessage?.(messageEvent);

      expect(subscriber).not.toHaveBeenCalled();
    });
  });

  /**
   * ========================================================================
   * TEST GROUP 5: Send Functionality
   * ========================================================================
   */
  describe("Send Functionality", () => {
    it("should send JSON-serialized messages when connected", () => {
      const service = new WebSocketService(
        "ws://localhost:8001/test",
        onMessageCallback
      );

      service.connect();
      mockWebSocket.readyState = mockWebSocket.OPEN;
      mockWebSocket.onopen?.();

      const testMessage = { type: "command", value: 123 };
      service.send(testMessage);

      expect(mockWebSocket.send).toHaveBeenCalledWith(
        JSON.stringify(testMessage)
      );
    });

    it("should NOT send when disconnected (silent failure)", () => {
      const service = new WebSocketService(
        "ws://localhost:8001/test",
        onMessageCallback
      );

      const testMessage = { type: "command" };
      service.send(testMessage);

      // Should not throw, just log warning
      expect(mockWebSocket.send).not.toHaveBeenCalled();
    });

    it("should check both isConnected flag AND readyState (dual checking)", () => {
      const service = new WebSocketService(
        "ws://localhost:8001/test",
        onMessageCallback
      );

      service.connect();
      mockWebSocket.onopen?.(); // Sets isConnected=true

      // Manually set readyState to CLOSED (simulates out-of-sync state)
      mockWebSocket.readyState = mockWebSocket.CLOSED;

      service.send({ type: "test" });

      // Should NOT send because readyState check fails
      expect(mockWebSocket.send).not.toHaveBeenCalled();
    });

    it("should handle JSON.stringify errors gracefully", () => {
      const service = new WebSocketService(
        "ws://localhost:8001/test",
        onMessageCallback
      );

      service.connect();
      mockWebSocket.readyState = mockWebSocket.OPEN;
      mockWebSocket.onopen?.();

      // Create circular reference (cannot be JSON serialized)
      const circular: { self?: unknown } = {};
      circular.self = circular;

      // Should not throw
      expect(() => service.send(circular as never)).not.toThrow();

      // Send should not be called because stringify failed
      expect(mockWebSocket.send).not.toHaveBeenCalled();
    });
  });

  /**
   * ========================================================================
   * TEST GROUP 6: Reconnection Logic - CURRENT FRAGILITIES
   * ========================================================================
   */
  describe("Reconnection Logic - Current Implementation", () => {
    it("should use LINEAR backoff (same delay for all retries)", () => {
      const service = new WebSocketService(
        "ws://localhost:8001/test",
        onMessageCallback
      );

      let connectionAttempts = 0;
      WebSocketConstructorSpy.mockImplementation(() => {
        connectionAttempts++;
        return mockWebSocket;
      });

      service.connect(3, 1000); // 3 retries, 1 second delay

      // Initial connection attempt
      expect(connectionAttempts).toBe(1);

      // First retry after close
      mockWebSocket.onclose?.();
      vi.advanceTimersByTime(1000);
      expect(connectionAttempts).toBe(2);

      // Second retry - STILL 1000ms delay (not exponential)
      mockWebSocket.onclose?.();
      vi.advanceTimersByTime(1000);
      expect(connectionAttempts).toBe(3);

      // Third retry - STILL 1000ms delay
      mockWebSocket.onclose?.();
      vi.advanceTimersByTime(1000);
      expect(connectionAttempts).toBe(4);
    });

    it("should stop retrying after retry exhaustion (current limitation)", () => {
      const service = new WebSocketService(
        "ws://localhost:8001/test",
        onMessageCallback
      );

      let connectionAttempts = 0;
      WebSocketConstructorSpy.mockImplementation(() => {
        connectionAttempts++;
        return mockWebSocket;
      });

      service.connect(5, 1000); // 5 retries, 1 second delay

      // Initial attempt
      expect(connectionAttempts).toBe(1);

      // Simulate 5 connection failures
      for (let i = 0; i < 5; i++) {
        mockWebSocket.onclose?.();
        vi.advanceTimersByTime(1000);
      }

      // Should have made initial + 5 retries = 6 total attempts
      expect(connectionAttempts).toBe(6);

      // Advance more time - should NOT retry again
      vi.advanceTimersByTime(10000);
      expect(connectionAttempts).toBe(6); // Still only 6 attempts
    });

    it("should use configurable retry count and delay", () => {
      const service = new WebSocketService(
        "ws://localhost:8001/test",
        onMessageCallback
      );

      let connectionAttempts = 0;
      WebSocketConstructorSpy.mockImplementation(() => {
        connectionAttempts++;
        return mockWebSocket;
      });

      service.connect(2, 500); // 2 retries, 500ms delay

      expect(connectionAttempts).toBe(1);

      // First retry
      mockWebSocket.onclose?.();
      vi.advanceTimersByTime(500);
      expect(connectionAttempts).toBe(2);

      // Second retry
      mockWebSocket.onclose?.();
      vi.advanceTimersByTime(500);
      expect(connectionAttempts).toBe(3);

      // No more retries
      mockWebSocket.onclose?.();
      vi.advanceTimersByTime(500);
      expect(connectionAttempts).toBe(3);
    });

    it("should default to 5 retries with 1 second delay", () => {
      const service = new WebSocketService(
        "ws://localhost:8001/test",
        onMessageCallback
      );

      let connectionAttempts = 0;
      WebSocketConstructorSpy.mockImplementation(() => {
        connectionAttempts++;
        return mockWebSocket;
      });

      // Call connect() without parameters
      service.connect();

      // Simulate all retries
      for (let i = 0; i < 5; i++) {
        mockWebSocket.onclose?.();
        vi.advanceTimersByTime(1000); // Default 1 second delay
      }

      expect(connectionAttempts).toBe(6); // Initial + 5 retries
    });

    it("should handle successful reconnection after failed attempts", () => {
      const service = new WebSocketService(
        "ws://localhost:8001/test",
        onMessageCallback
      );

      service.connect(3, 1000);

      // First connection fails
      mockWebSocket.onclose?.();
      vi.advanceTimersByTime(1000);

      // Second connection fails
      mockWebSocket.onclose?.();
      vi.advanceTimersByTime(1000);

      // Third connection succeeds - set readyState THEN call onopen
      mockWebSocket.readyState = mockWebSocket.OPEN;
      mockWebSocket.onopen?.();

      expect(service.isOpen()).toBe(true);

      // Send message to verify connection works
      service.send({ type: "test" });
      expect(mockWebSocket.send).toHaveBeenCalled();
    });
  });

  /**
   * ========================================================================
   * TEST GROUP 7: Error Handling - CURRENT FRAGILITIES
   * ========================================================================
   */
  describe("Error Handling - Current Implementation", () => {
    it("should log WebSocket onerror events without crashing", () => {
      const service = new WebSocketService(
        "ws://localhost:8001/test",
        onMessageCallback
      );

      service.connect();

      const errorEvent = new Event("error");

      // Should not throw
      expect(() => mockWebSocket.onerror?.(errorEvent)).not.toThrow();
    });

    it("should catch subscriber errors but not propagate them (current behavior)", () => {
      const service = new WebSocketService(
        "ws://localhost:8001/test",
        onMessageCallback
      );

      const subscriber1 = vi.fn(() => {
        throw new Error("Subscriber 1 error");
      });
      const subscriber2 = vi.fn();

      service.subscribe(subscriber1);
      service.subscribe(subscriber2);

      service.connect();
      mockWebSocket.onopen?.();

      const messageEvent = new MessageEvent("message", {
        data: JSON.stringify({ test: true }),
      });

      // CURRENT BEHAVIOR: The try/catch in onmessage catches ALL errors
      // including subscriber errors. This means errors are swallowed and
      // logged to console, but subscriber2 is never called because the
      // error stops forEach execution before it reaches subscriber2.
      //
      // FRAGILE: Errors swallowed silently (only console.warn)
      // FRAGILE: One bad subscriber prevents others from being notified
      expect(() => {
        mockWebSocket.onmessage?.(messageEvent);
      }).not.toThrow(); // Error is caught by try/catch

      expect(subscriber1).toHaveBeenCalled();
      // subscriber2 NOT called because forEach stops on error
      expect(subscriber2).not.toHaveBeenCalled();
    });

    it("should catch onMessage callback errors and prevent subscriber execution", () => {
      const throwingCallback = vi.fn(() => {
        throw new Error("onMessage error");
      });

      const service = new WebSocketService(
        "ws://localhost:8001/test",
        throwingCallback
      );

      const subscriber = vi.fn();
      service.subscribe(subscriber);

      service.connect();
      mockWebSocket.onopen?.();

      const messageEvent = new MessageEvent("message", {
        data: JSON.stringify({ test: true }),
      });

      // CURRENT BEHAVIOR: try/catch catches onMessage error
      // Error swallowed silently, subscribers never called
      expect(() => {
        mockWebSocket.onmessage?.(messageEvent);
      }).not.toThrow(); // Error is caught

      expect(throwingCallback).toHaveBeenCalled();
      expect(subscriber).not.toHaveBeenCalled();
    });

    it("should NOT prevent scheduled reconnection when disconnect is called", () => {
      const service = new WebSocketService(
        "ws://localhost:8001/test",
        onMessageCallback
      );

      service.connect(5, 1000);

      // Initial connection created
      expect(WebSocketConstructorSpy).toHaveBeenCalledTimes(1);

      // Connection fails, schedules reconnection
      mockWebSocket.onclose?.();

      // Advance time partially (reconnection scheduled but not executed)
      vi.advanceTimersByTime(500);

      // User calls disconnect (sets isConnected=false, but can't cancel setTimeout)
      service.disconnect();

      // Advance remaining time - reconnection WILL happen
      vi.advanceTimersByTime(500);

      // CURRENT LIMITATION: Scheduled reconnection still fires even after disconnect
      // because there's no way to cancel the setTimeout callback
      // The reconnection attempt is made, creating a second WebSocket
      expect(WebSocketConstructorSpy).toHaveBeenCalledTimes(2);

      // However, if we check again, the reconnection guard will prevent further attempts
      // because isConnected is now set by the reconnection attempt
      expect(service.isOpen()).toBe(false);
    });
  });

  /**
   * ========================================================================
   * TEST GROUP 8: Edge Cases and State Management
   * ========================================================================
   */
  describe("Edge Cases and State Management", () => {
    it("should handle rapid connect/disconnect cycles", () => {
      const service = new WebSocketService(
        "ws://localhost:8001/test",
        onMessageCallback
      );

      service.connect();
      mockWebSocket.onopen?.();
      expect(service.isOpen()).toBe(true);

      service.disconnect();
      expect(service.isOpen()).toBe(false);

      // Reconnect immediately
      service.connect();
      mockWebSocket.onopen?.();
      expect(service.isOpen()).toBe(true);

      // Should work normally
      expect(WebSocketConstructorSpy).toHaveBeenCalledTimes(2);
    });

    it("should persist subscribers across disconnect/reconnect", () => {
      const service = new WebSocketService(
        "ws://localhost:8001/test",
        onMessageCallback
      );

      const subscriber = vi.fn();
      service.subscribe(subscriber);

      service.connect();
      mockWebSocket.onopen?.();
      service.disconnect();

      // Reconnect
      service.connect();
      mockWebSocket.onopen?.();

      const messageEvent = new MessageEvent("message", {
        data: JSON.stringify({ test: true }),
      });

      mockWebSocket.onmessage?.(messageEvent);

      // Subscriber should still be called after reconnect
      expect(subscriber).toHaveBeenCalled();
    });

    it("should handle messages with various data types", () => {
      const service = new WebSocketService(
        "ws://localhost:8001/test",
        onMessageCallback
      );

      service.connect();
      mockWebSocket.onopen?.();

      // Test various JSON-compatible types
      const testCases = [
        { value: null },
        { value: true },
        { value: false },
        { value: 0 },
        { value: 123.456 },
        { value: "string" },
        { value: [] },
        { value: [1, 2, 3] },
        { value: {} },
        { value: { nested: { deep: { object: true } } } },
      ];

      testCases.forEach((testCase, index) => {
        const messageEvent = new MessageEvent("message", {
          data: JSON.stringify(testCase),
        });

        mockWebSocket.onmessage?.(messageEvent);

        expect(onMessageCallback).toHaveBeenNthCalledWith(index + 1, testCase);
      });
    });

    it("should maintain isConnected state consistency", () => {
      const service = new WebSocketService(
        "ws://localhost:8001/test",
        onMessageCallback
      );

      // Initial state
      expect(service.isOpen()).toBe(false);

      // After connect (before open)
      service.connect();
      expect(service.isOpen()).toBe(false);

      // After open
      mockWebSocket.onopen?.();
      expect(service.isOpen()).toBe(true);

      // After close
      mockWebSocket.onclose?.();
      expect(service.isOpen()).toBe(false);
    });

    it("should handle multiple WebSocket error events", () => {
      const service = new WebSocketService(
        "ws://localhost:8001/test",
        onMessageCallback
      );

      service.connect();

      const errorEvent = new Event("error");

      // Multiple errors should not crash
      expect(() => {
        mockWebSocket.onerror?.(errorEvent);
        mockWebSocket.onerror?.(errorEvent);
        mockWebSocket.onerror?.(errorEvent);
      }).not.toThrow();
    });
  });

  /**
   * ========================================================================
   * TEST GROUP 9: Type Safety and Generics
   * ========================================================================
   */
  describe("Type Safety and Generics", () => {
    interface TypedMessage {
      id: number;
      name: string;
      data: {
        value: number;
        tags: string[];
      };
    }

    it("should maintain type safety with generic parameter", () => {
      const typedCallback = vi.fn<[TypedMessage], void>();
      const service = new WebSocketService<TypedMessage>(
        "ws://localhost:8001/test",
        typedCallback
      );

      service.connect();
      mockWebSocket.onopen?.();

      const typedMessage: TypedMessage = {
        id: 123,
        name: "test_node",
        data: {
          value: 42,
          tags: ["calibration", "quantum"],
        },
      };

      const messageEvent = new MessageEvent("message", {
        data: JSON.stringify(typedMessage),
      });

      mockWebSocket.onmessage?.(messageEvent);

      expect(typedCallback).toHaveBeenCalledWith(typedMessage);
    });

    it("should work with union types", () => {
      type UnionMessage =
        | { type: "status"; value: number }
        | { type: "error"; message: string };

      const unionCallback = vi.fn<[UnionMessage], void>();
      const service = new WebSocketService<UnionMessage>(
        "ws://localhost:8001/test",
        unionCallback
      );

      service.connect();
      mockWebSocket.onopen?.();

      const statusMessage: UnionMessage = { type: "status", value: 100 };
      const errorMessage: UnionMessage = { type: "error", message: "failed" };

      const statusEvent = new MessageEvent("message", {
        data: JSON.stringify(statusMessage),
      });
      const errorEvent = new MessageEvent("message", {
        data: JSON.stringify(errorMessage),
      });

      mockWebSocket.onmessage?.(statusEvent);
      mockWebSocket.onmessage?.(errorEvent);

      expect(unionCallback).toHaveBeenCalledWith(statusMessage);
      expect(unionCallback).toHaveBeenCalledWith(errorMessage);
    });
  });
});
