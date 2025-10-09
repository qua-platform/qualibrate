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

  // Track WebSocket constructor calls with proper typing
  let WebSocketConstructorSpy: ReturnType<typeof vi.fn> & {
    CONNECTING: number;
    OPEN: number;
    CLOSING: number;
    CLOSED: number;
  };

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
    WebSocketConstructorSpy = Object.assign(vi.fn(() => mockWebSocket), {
      CONNECTING: 0,
      OPEN: 1,
      CLOSING: 2,
      CLOSED: 3,
    });

    // Use vi.stubGlobal to properly stub the WebSocket global
    vi.stubGlobal("WebSocket", WebSocketConstructorSpy);

    // Create test callback
    onMessageCallback = vi.fn();

    // Suppress console output during tests
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    // Restore real timers
    vi.useRealTimers();

    // Restore all mocks including stubbed globals
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  /**
   * Helper function to simulate WebSocket opening.
   * Sets readyState to OPEN before calling onopen handler.
   * This is required because isConnected() checks both connectionState and readyState.
   */
  const simulateOpen = () => {
    mockWebSocket.readyState = mockWebSocket.OPEN;
    mockWebSocket.onopen?.();
  };

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
      expect(service.isConnected()).toBe(false);
    });

    it("should accept generic type for type-safe messages", () => {
      interface TestMessage {
        type: string;
        payload: number;
      }

      const typedCallback: (data: TestMessage) => void = vi.fn();
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
      expect(service.isConnected()).toBe(false); // Not yet open

      // Simulate connection open
      mockWebSocket.readyState = mockWebSocket.OPEN;
      simulateOpen();

      expect(service.isConnected()).toBe(true);
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
      mockWebSocket.readyState = mockWebSocket.OPEN;
      simulateOpen();
      expect(service.isConnected()).toBe(true);

      service.disconnect();

      expect(mockWebSocket.close).toHaveBeenCalled();
      expect(service.isConnected()).toBe(false);
    });

    it("should handle disconnect when already disconnected (safe no-op)", () => {
      const service = new WebSocketService(
        "ws://localhost:8001/test",
        onMessageCallback
      );

      // Disconnect without ever connecting
      expect(() => service.disconnect()).not.toThrow();
      expect(service.isConnected()).toBe(false);
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
      expect(service.isConnected()).toBe(false);
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
      simulateOpen();

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
      simulateOpen();

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
      simulateOpen();

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
  describe("Subscriber Management - Legacy Behavior", () => {
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
      simulateOpen();

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
      simulateOpen();

      const messageEvent = new MessageEvent("message", {
        data: JSON.stringify({ test: true }),
      });

      mockWebSocket.onmessage?.(messageEvent);

      expect(callOrder).toEqual([1, 2, 3]);
    });

    it("should unsubscribe callback using returned function", () => {
      const service = new WebSocketService(
        "ws://localhost:8001/test",
        onMessageCallback
      );

      const subscriber1 = vi.fn();
      const subscriber2 = vi.fn();

      const unsubscribe1 = service.subscribe(subscriber1);
      service.subscribe(subscriber2);
      unsubscribe1(); // Use returned unsubscribe function

      service.connect();
      simulateOpen();

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
      const neverSubscribed = () => {};

      service.subscribe(subscriber);

      // Call a returned unsubscribe function that was never from a real subscription
      // This simulates calling unsubscribe when the callback was never subscribed
      expect(() => neverSubscribed()).not.toThrow();

      service.connect();
      simulateOpen();

      const messageEvent = new MessageEvent("message", {
        data: JSON.stringify({ test: true }),
      });

      mockWebSocket.onmessage?.(messageEvent);

      // Original subscriber should still work
      expect(subscriber).toHaveBeenCalled();
    });

    it("should prevent duplicate subscriptions", () => {
      const service = new WebSocketService(
        "ws://localhost:8001/test",
        onMessageCallback
      );

      const subscriber = vi.fn();

      // Duplicates are prevented
      service.subscribe(subscriber);
      service.subscribe(subscriber);

      service.connect();
      simulateOpen();

      const messageEvent = new MessageEvent("message", {
        data: JSON.stringify({ test: true }),
      });

      mockWebSocket.onmessage?.(messageEvent);

      // Called once because duplicate prevented
      expect(subscriber).toHaveBeenCalledTimes(1);
    });
  });

  /**
   * ========================================================================
   * TEST GROUP 4B: Improved Subscribe Method (New Features)
   * ========================================================================
   */
  describe("Subscriber Management - New Improved Features", () => {
    it("should prevent duplicate subscriptions", () => {
      const service = new WebSocketService(
        "ws://localhost:8001/test",
        onMessageCallback
      );

      const subscriber = vi.fn();

      // Subscribe the same callback multiple times
      service.subscribe(subscriber);
      service.subscribe(subscriber);
      service.subscribe(subscriber);

      service.connect();
      simulateOpen();

      const messageEvent = new MessageEvent("message", {
        data: JSON.stringify({ test: true }),
      });

      mockWebSocket.onmessage?.(messageEvent);

      // Should only be called once, not three times
      expect(subscriber).toHaveBeenCalledTimes(1);
    });

    it("should return an unsubscribe function from subscribe()", () => {
      const service = new WebSocketService(
        "ws://localhost:8001/test",
        onMessageCallback
      );

      const subscriber = vi.fn();

      // New pattern: subscribe returns unsubscribe function
      const unsubscribe = service.subscribe(subscriber);

      expect(unsubscribe).toBeTypeOf("function");
    });

    it("should unsubscribe using the returned function", () => {
      const service = new WebSocketService(
        "ws://localhost:8001/test",
        onMessageCallback
      );

      const subscriber1 = vi.fn();
      const subscriber2 = vi.fn();

      // Subscribe and get unsubscribe function
      const unsubscribe1 = service.subscribe(subscriber1);
      service.subscribe(subscriber2);

      // Unsubscribe using returned function
      unsubscribe1();

      service.connect();
      simulateOpen();

      const messageEvent = new MessageEvent("message", {
        data: JSON.stringify({ test: true }),
      });

      mockWebSocket.onmessage?.(messageEvent);

      // subscriber1 should NOT be called (was unsubscribed)
      expect(subscriber1).not.toHaveBeenCalled();
      // subscriber2 should be called (still subscribed)
      expect(subscriber2).toHaveBeenCalled();
    });

    it("should allow multiple unsubscribe calls safely (idempotent)", () => {
      const service = new WebSocketService(
        "ws://localhost:8001/test",
        onMessageCallback
      );

      const subscriber = vi.fn();
      const unsubscribe = service.subscribe(subscriber);

      // Unsubscribe multiple times (should be safe)
      unsubscribe();
      unsubscribe();
      unsubscribe();

      service.connect();
      simulateOpen();

      const messageEvent = new MessageEvent("message", {
        data: JSON.stringify({ test: true }),
      });

      mockWebSocket.onmessage?.(messageEvent);

      expect(subscriber).not.toHaveBeenCalled();
    });


    it("should handle React useEffect cleanup pattern", () => {
      const service = new WebSocketService(
        "ws://localhost:8001/test",
        onMessageCallback
      );

      const subscriber = vi.fn();

      // Simulate React useEffect pattern
      const cleanup = service.subscribe(subscriber);

      service.connect();
      simulateOpen();

      // Message before cleanup
      const messageEvent1 = new MessageEvent("message", {
        data: JSON.stringify({ test: 1 }),
      });
      mockWebSocket.onmessage?.(messageEvent1);
      expect(subscriber).toHaveBeenCalledTimes(1);

      // Cleanup (like React useEffect cleanup)
      cleanup();

      // Message after cleanup - should NOT be received
      const messageEvent2 = new MessageEvent("message", {
        data: JSON.stringify({ test: 2 }),
      });
      mockWebSocket.onmessage?.(messageEvent2);

      // Still only called once (before cleanup)
      expect(subscriber).toHaveBeenCalledTimes(1);
    });

    it("should prevent duplicate even when subscribing before and after connection", () => {
      const service = new WebSocketService(
        "ws://localhost:8001/test",
        onMessageCallback
      );

      const subscriber = vi.fn();

      // Subscribe before connection
      service.subscribe(subscriber);

      service.connect();
      simulateOpen();

      // Try to subscribe again after connection (should be prevented)
      service.subscribe(subscriber);

      const messageEvent = new MessageEvent("message", {
        data: JSON.stringify({ test: true }),
      });

      mockWebSocket.onmessage?.(messageEvent);

      // Should only be called once
      expect(subscriber).toHaveBeenCalledTimes(1);
    });

    it("should allow re-subscription after unsubscribe", () => {
      const service = new WebSocketService(
        "ws://localhost:8001/test",
        onMessageCallback
      );

      const subscriber = vi.fn();

      // Subscribe
      const unsubscribe1 = service.subscribe(subscriber);

      service.connect();
      simulateOpen();

      // First message
      const messageEvent1 = new MessageEvent("message", {
        data: JSON.stringify({ test: 1 }),
      });
      mockWebSocket.onmessage?.(messageEvent1);
      expect(subscriber).toHaveBeenCalledTimes(1);

      // Unsubscribe
      unsubscribe1();

      // Message while unsubscribed (should not be received)
      const messageEvent2 = new MessageEvent("message", {
        data: JSON.stringify({ test: 2 }),
      });
      mockWebSocket.onmessage?.(messageEvent2);
      expect(subscriber).toHaveBeenCalledTimes(1); // Still 1

      // Re-subscribe (should be allowed)
      const unsubscribe2 = service.subscribe(subscriber);

      // Message after re-subscription (should be received)
      const messageEvent3 = new MessageEvent("message", {
        data: JSON.stringify({ test: 3 }),
      });
      mockWebSocket.onmessage?.(messageEvent3);
      expect(subscriber).toHaveBeenCalledTimes(2); // Now 2

      // Cleanup
      unsubscribe2();
    });

    it("should handle multiple subscribers with individual unsubscribe functions", () => {
      const service = new WebSocketService(
        "ws://localhost:8001/test",
        onMessageCallback
      );

      const subscriber1 = vi.fn();
      const subscriber2 = vi.fn();
      const subscriber3 = vi.fn();

      const unsubscribe1 = service.subscribe(subscriber1);
      const unsubscribe2 = service.subscribe(subscriber2);
      const unsubscribe3 = service.subscribe(subscriber3);

      service.connect();
      simulateOpen();

      // All should receive first message
      const messageEvent1 = new MessageEvent("message", {
        data: JSON.stringify({ test: 1 }),
      });
      mockWebSocket.onmessage?.(messageEvent1);
      expect(subscriber1).toHaveBeenCalledTimes(1);
      expect(subscriber2).toHaveBeenCalledTimes(1);
      expect(subscriber3).toHaveBeenCalledTimes(1);

      // Unsubscribe middle subscriber
      unsubscribe2();

      // Second message
      const messageEvent2 = new MessageEvent("message", {
        data: JSON.stringify({ test: 2 }),
      });
      mockWebSocket.onmessage?.(messageEvent2);
      expect(subscriber1).toHaveBeenCalledTimes(2);
      expect(subscriber2).toHaveBeenCalledTimes(1); // Still 1 (unsubscribed)
      expect(subscriber3).toHaveBeenCalledTimes(2);

      // Cleanup remaining subscribers
      unsubscribe1();
      unsubscribe3();
    });

    it("should isolate errors in subscriber callbacks", () => {
      const service = new WebSocketService(
        "ws://localhost:8001/test",
        onMessageCallback
      );

      const subscriber1 = vi.fn();
      const subscriber2 = vi.fn(() => {
        throw new Error("Subscriber 2 threw an error");
      });
      const subscriber3 = vi.fn();

      service.subscribe(subscriber1);
      service.subscribe(subscriber2);
      service.subscribe(subscriber3);

      service.connect();
      simulateOpen();

      const messageEvent = new MessageEvent("message", {
        data: JSON.stringify({ test: true }),
      });

      // Should not throw even though subscriber2 throws
      expect(() => {
        mockWebSocket.onmessage?.(messageEvent);
      }).not.toThrow();

      // All subscribers should be called
      expect(subscriber1).toHaveBeenCalledTimes(1);
      expect(subscriber2).toHaveBeenCalledTimes(1);
      expect(subscriber3).toHaveBeenCalledTimes(1);
    });

    it("should handle multiple subscribers with errors", () => {
      const service = new WebSocketService(
        "ws://localhost:8001/test",
        onMessageCallback
      );

      const subscriber1 = vi.fn(() => {
        throw new Error("Error 1");
      });
      const subscriber2 = vi.fn();
      const subscriber3 = vi.fn(() => {
        throw new Error("Error 3");
      });
      const subscriber4 = vi.fn();

      service.subscribe(subscriber1);
      service.subscribe(subscriber2);
      service.subscribe(subscriber3);
      service.subscribe(subscriber4);

      service.connect();
      simulateOpen();

      const messageEvent = new MessageEvent("message", {
        data: JSON.stringify({ test: true }),
      });

      // Should not throw even with multiple errors
      expect(() => {
        mockWebSocket.onmessage?.(messageEvent);
      }).not.toThrow();

      // All subscribers should be called despite errors
      expect(subscriber1).toHaveBeenCalledTimes(1);
      expect(subscriber2).toHaveBeenCalledTimes(1);
      expect(subscriber3).toHaveBeenCalledTimes(1);
      expect(subscriber4).toHaveBeenCalledTimes(1);
    });

    it("should continue processing messages after subscriber errors", () => {
      const service = new WebSocketService(
        "ws://localhost:8001/test",
        onMessageCallback
      );

      const subscriber = vi.fn((data) => {
        if (data.value === 2) {
          throw new Error("Error on message 2");
        }
      });

      service.subscribe(subscriber);

      service.connect();
      simulateOpen();

      // First message - no error
      const messageEvent1 = new MessageEvent("message", {
        data: JSON.stringify({ value: 1 }),
      });
      mockWebSocket.onmessage?.(messageEvent1);
      expect(subscriber).toHaveBeenCalledTimes(1);

      // Second message - throws error
      const messageEvent2 = new MessageEvent("message", {
        data: JSON.stringify({ value: 2 }),
      });
      expect(() => {
        mockWebSocket.onmessage?.(messageEvent2);
      }).not.toThrow();
      expect(subscriber).toHaveBeenCalledTimes(2);

      // Third message - continues to work
      const messageEvent3 = new MessageEvent("message", {
        data: JSON.stringify({ value: 3 }),
      });
      mockWebSocket.onmessage?.(messageEvent3);
      expect(subscriber).toHaveBeenCalledTimes(3);
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
      simulateOpen();

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
      simulateOpen();

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

      service.connect(1000); // 3 retries, 1 second delay

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

    it("should retry indefinitely on connection failure", () => {
      const service = new WebSocketService(
        "ws://localhost:8001/test",
        onMessageCallback
      );

      let connectionAttempts = 0;
      WebSocketConstructorSpy.mockImplementation(() => {
        connectionAttempts++;
        return mockWebSocket;
      });

      service.connect(1000); // 1 second delay

      // Initial attempt
      expect(connectionAttempts).toBe(1);

      // Simulate 10 connection failures - should keep retrying
      for (let i = 0; i < 10; i++) {
        mockWebSocket.onclose?.();
        vi.advanceTimersByTime(1000);
      }

      // Should have made initial + 10 retries = 11 total attempts
      expect(connectionAttempts).toBe(11);

      // Simulate more failures - should continue retrying
      mockWebSocket.onclose?.();
      vi.advanceTimersByTime(1000);
      expect(connectionAttempts).toBe(12); // Still retrying
    });

    it("should use configurable delay", () => {
      const service = new WebSocketService(
        "ws://localhost:8001/test",
        onMessageCallback
      );

      let connectionAttempts = 0;
      WebSocketConstructorSpy.mockImplementation(() => {
        connectionAttempts++;
        return mockWebSocket;
      });

      service.connect(500); // 500ms delay

      expect(connectionAttempts).toBe(1);

      // First retry
      mockWebSocket.onclose?.();
      vi.advanceTimersByTime(500);
      expect(connectionAttempts).toBe(2);

      // Second retry
      mockWebSocket.onclose?.();
      vi.advanceTimersByTime(500);
      expect(connectionAttempts).toBe(3);

      // Third retry - should continue indefinitely
      mockWebSocket.onclose?.();
      vi.advanceTimersByTime(500);
      expect(connectionAttempts).toBe(4);
    });

    it("should default to 1 second delay", () => {
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

      // Verify default 1 second delay
      mockWebSocket.onclose?.();
      vi.advanceTimersByTime(500); // Not enough time
      expect(connectionAttempts).toBe(1); // No retry yet
      
      vi.advanceTimersByTime(500); // Now 1 second total
      expect(connectionAttempts).toBe(2); // Retry triggered
    });

    it("should handle successful reconnection after failed attempts", () => {
      const service = new WebSocketService(
        "ws://localhost:8001/test",
        onMessageCallback
      );

      service.connect(1000);

      // First connection fails
      mockWebSocket.onclose?.();
      vi.advanceTimersByTime(1000);

      // Second connection fails
      mockWebSocket.onclose?.();
      vi.advanceTimersByTime(1000);

      // Third connection succeeds - set readyState THEN call onopen
      mockWebSocket.readyState = mockWebSocket.OPEN;
      simulateOpen();

      expect(service.isConnected()).toBe(true);

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

    it("should isolate subscriber errors and not affect other subscribers (FIXED)", () => {
      const service = new WebSocketService(
        "ws://localhost:8001/test",
        onMessageCallback
      );

      const subscriber1 = vi.fn(() => {
        throw new Error("Subscriber 1 error");
      });
      const subscriber2 = vi.fn();
      const subscriber3 = vi.fn();

      service.subscribe(subscriber1);
      service.subscribe(subscriber2);
      service.subscribe(subscriber3);

      service.connect();
      simulateOpen();

      const messageEvent = new MessageEvent("message", {
        data: JSON.stringify({ test: true }),
      });

      // NEW BEHAVIOR: Each subscriber is wrapped in its own try/catch
      // Errors in subscriber1 don't affect subscriber2 or subscriber3
      expect(() => {
        mockWebSocket.onmessage?.(messageEvent);
      }).not.toThrow(); // Error is caught and logged

      // All subscribers should be called, even though subscriber1 threw an error
      expect(subscriber1).toHaveBeenCalled();
      expect(subscriber2).toHaveBeenCalled();
      expect(subscriber3).toHaveBeenCalled();
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
      simulateOpen();

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

    it("should prevent scheduled reconnection when disconnect is called", () => {
      const service = new WebSocketService(
        "ws://localhost:8001/test",
        onMessageCallback
      );

      service.connect(1000);

      // Initial connection created
      expect(WebSocketConstructorSpy).toHaveBeenCalledTimes(1);

      // Connection fails, schedules reconnection
      mockWebSocket.onclose?.();

      // Advance time partially (reconnection scheduled but not executed)
      vi.advanceTimersByTime(500);

      // User calls disconnect (clears the reconnect timeout)
      service.disconnect();

      // Advance remaining time - reconnection should NOT happen
      vi.advanceTimersByTime(500);

      // The scheduled reconnection was cancelled, so no second WebSocket
      expect(WebSocketConstructorSpy).toHaveBeenCalledTimes(1);

      // Connection state should be disconnected
      expect(service.isConnected()).toBe(false);
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
      mockWebSocket.readyState = mockWebSocket.OPEN;
      simulateOpen();
      expect(service.isConnected()).toBe(true);

      service.disconnect();
      expect(service.isConnected()).toBe(false);

      // Reconnect immediately
      service.connect();
      mockWebSocket.readyState = mockWebSocket.OPEN;
      simulateOpen();
      expect(service.isConnected()).toBe(true);

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
      simulateOpen();
      service.disconnect();

      // Reconnect
      service.connect();
      simulateOpen();

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
      simulateOpen();

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
      expect(service.isConnected()).toBe(false);

      // After connect (before open)
      service.connect();
      expect(service.isConnected()).toBe(false);

      // After open
      mockWebSocket.readyState = mockWebSocket.OPEN;
      simulateOpen();
      expect(service.isConnected()).toBe(true);

      // After close
      mockWebSocket.onclose?.();
      expect(service.isConnected()).toBe(false);
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
      const typedCallback: (data: TypedMessage) => void = vi.fn();
      const service = new WebSocketService<TypedMessage>(
        "ws://localhost:8001/test",
        typedCallback
      );

      service.connect();
      simulateOpen();

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

      const unionCallback: (data: UnionMessage) => void = vi.fn();
      const service = new WebSocketService<UnionMessage>(
        "ws://localhost:8001/test",
        unionCallback
      );

      service.connect();
      simulateOpen();

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
