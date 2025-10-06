/**
 * @fileoverview Generic WebSocket client with automatic reconnection and pub/sub pattern.
 *
 * Provides a reusable WebSocket wrapper class for real-time bidirectional communication
 * with automatic reconnection logic and multiple subscriber support.
 *
 * **Primary Use Case**:
 * Used by WebSocketContext.tsx to manage two real-time connections for quantum calibration:
 * - Run status updates: Real-time node/graph execution progress
 * - Execution history: Historical calibration data for timeline visualization
 *
 * **Key Features**:
 * - Type-safe message handling via TypeScript generics
 * - Automatic reconnection with configurable retry attempts (default: 5 retries, 1s delay)
 * - Pub/sub pattern allowing multiple callbacks per WebSocket connection
 * - JSON serialization/deserialization of all messages
 * - Connection state tracking with isConnected flag
 *
 * **Architecture Pattern**:
 * The service implements a facade pattern over the native WebSocket API, adding
 * resilience features (reconnection) and developer experience improvements (pub/sub,
 * type safety) without requiring changes to consuming code.
 *
 * **FRAGILE AREAS (Improvement Opportunities)**:
 * 1. **Reconnection Strategy**: Linear backoff (constant delay) instead of exponential
 * 2. **Retry Exhaustion**: After 5 failed attempts, connection permanently fails
 * 3. **State Tracking**: Manual isConnected flag may become out-of-sync with WebSocket.readyState
 * 4. **Error Handling**: Console-only logging, no user-facing error notifications
 * 5. **Subscriber Errors**: Uncaught errors in subscribers can affect other subscribers
 * 6. **No Runtime Type Validation**: Type safety is compile-time only
 *
 * @see WebSocketContext for React integration and provider implementation
 * @see WS_GET_STATUS and WS_EXECUTION_HISTORY for WebSocket endpoint routes
 */

/**
 * Generic WebSocket client with automatic reconnection and pub/sub pattern.
 *
 * **Message Protocol**:
 * - All messages must be JSON-serializable objects
 * - Messages automatically parsed via JSON.parse() on receive
 * - Invalid JSON messages logged as warnings, not thrown as errors
 * - Type safety enforced via generic parameter T (compile-time only, no runtime validation)
 *
 * **Current Usage in QUAlibrate**:
 * Used by WebSocketContext.tsx to manage two real-time connections:
 * 1. Run Status WebSocket (`/execution/ws/run_status`) - node/graph execution updates
 * 2. Execution History WebSocket (`/execution/ws/workflow_execution_history`) - historical data
 *
 * **FRAGILE: Reconnection Limitations**:
 * After retry exhaustion (default 5 attempts), the WebSocket remains permanently
 * disconnected until page refresh. Consider implementing:
 * - Exponential backoff instead of linear backoff for better network resilience
 * - Unlimited reconnection attempts with increasing delays (e.g., cap at 30s)
 * - User-facing "reconnect" button when connection lost
 * - Circuit breaker pattern to avoid overwhelming server during outages
 *
 * **FRAGILE: State Tracking**:
 * `isConnected` flag is manually managed and may become out-of-sync with actual
 * WebSocket.readyState. The send() method performs an additional readyState check
 * as a safety measure. Consider using WebSocket.readyState directly as source of truth.
 *
 * **IMPROVEMENT NEEDED: Error Handling**:
 * - Connection errors only log to console (no user feedback mechanism)
 * - No connection timeout handling (browser default timeout varies)
 * - No distinction between recoverable (network issues) vs non-recoverable (bad URL) errors
 *
 * @template T - The message type for this WebSocket connection (must be JSON-serializable)
 *
 * @see WebSocketContext for React integration and usage in component tree
 * @see WS_GET_STATUS and WS_EXECUTION_HISTORY for WebSocket route constants
 */
export default class WebSocketService<T> {
  /**
   * WebSocket connection instance. Null when disconnected.
   * @private
   */
  private ws: WebSocket | null = null;

  /**
   * WebSocket URL (e.g., "ws://localhost:8001/execution/ws/run_status").
   * Immutable after construction.
   * @private
   * @readonly
   */
  private readonly url: string;

  /**
   * Manual connection state tracking flag.
   *
   * FRAGILE: This flag is manually managed and may become out-of-sync with
   * the actual WebSocket.readyState. The send() method performs an additional
   * readyState check as a safety measure. Consider refactoring to use
   * WebSocket.readyState as the single source of truth.
   *
   * @private
   */
  private isConnected: boolean = false;

  /**
   * Primary message callback provided during construction.
   * Called for every message received, before notifying subscribers.
   * @private
   * @readonly
   */
  private readonly onMessage: (data: T) => void;

  /**
   * Array of subscriber callbacks registered via subscribe() method.
   * All subscribers are notified after onMessage callback.
   *
   * Subscribers are responsible for their own error handling - uncaught errors
   * in subscriber callbacks will propagate and may affect other subscribers.
   *
   * @private
   */
  private subscribers: ((data: T) => void)[] = [];

  /**
   * Construct a new WebSocket service instance.
   *
   * Does NOT automatically connect - call connect() to establish connection.
   *
   * @param url - Full WebSocket URL (e.g., "ws://localhost:8001/ws/status")
   * @param onMessage - Callback invoked for every received message (before subscribers)
   *
   */
  constructor(url: string, onMessage: (data: T) => void) {
    this.url = url;
    this.onMessage = onMessage;
  }

  /**
   * Establish WebSocket connection with automatic retry on failure.
   *
   * Sets up event handlers for connection lifecycle (onopen, onmessage, onerror, onclose)
   * and implements automatic reconnection with linear backoff strategy.
   *
   * **Connection Process**:
   * 1. Check if already connected (early return if yes)
   * 2. Create new WebSocket instance with this.url
   * 3. Set isConnected=true on successful open
   * 4. Handle incoming messages by parsing JSON and notifying callbacks
   * 5. On connection close, retry with decremented retry count
   *
   * **Reconnection Behavior**:
   * - Uses LINEAR backoff (same delay between all retry attempts)
   * - Default: 5 retries with 1 second delay = max 5 seconds of retry attempts
   * - After retry exhaustion, connection permanently fails (no further attempts)
   * - Each retry decrements the retries parameter by 1
   *
   * **FRAGILE: No Exponential Backoff**:
   * Linear backoff can overwhelm server during outages (constant retry rate).
   * Consider exponential backoff: delay = 1s, 2s, 4s, 8s, 16s, capped at 30s.
   *
   * **FRAGILE: Limited Retry Attempts**:
   * After 5 failed attempts, reconnection stops permanently until page refresh.
   * Users lose real-time updates for the rest of their session. Consider:
   * - Unlimited retries with increasing delays (exponential backoff to 30s max)
   * - User-facing "reconnect" button when connection fails
   * - React context state to expose connection status to UI
   *
   * **Error Handling**:
   * - Constructor errors caught and logged (connection attempt failures)
   * - Message parsing errors caught in onmessage handler (invalid JSON)
   * - All errors only log to console, no user-facing notifications
   * - No distinction between recoverable vs permanent failures
   *
   * @param retries - Number of reconnection attempts remaining (default: 5)
   * @param delay - Milliseconds between retry attempts (default: 1000)
   *
   * @remarks
   * Connection failures are logged to console but don't throw errors.
   * Use isOpen() to check connection state after calling connect().
   *
   * Guard against duplicate connections: returns early if isConnected is true.
   * However, isConnected flag can become stale (see FRAGILE note in field docs).
   *
   * @see disconnect for closing connection gracefully
   * @see isOpen for checking current connection state
   */
  connect(retries = 5, delay = 1000) {
    // Guard: prevent duplicate connections by checking isConnected flag
    if (this.isConnected) {
      console.warn("⚠️ WebSocket is already connected:", this.url);
      return;
    }

    try {
      // Create WebSocket instance - may throw if URL is invalid
      this.ws = new WebSocket(this.url);

      // Event handler: connection successfully established
      this.ws.onopen = () => {
        this.isConnected = true;
        console.log("✅ WebSocket connected:", this.url);
      };

      // Event handler: message received from server
      // All messages expected to be JSON, parsed and distributed to callbacks
      this.ws.onmessage = (event) => {
        try {
          // Parse JSON message and type-cast to expected type T
          // FRAGILE: No runtime type validation, only compile-time type safety
          const data = JSON.parse(event.data) as T;

          // Call primary callback first (provided in constructor)
          this.onMessage(data);

          // Then notify all subscribers (pub/sub pattern)
          // FRAGILE: Errors in subscriber callbacks will propagate and may affect
          // subsequent subscribers. Consider wrapping in try/catch per subscriber.
          this.subscribers.forEach((cb) => cb(data));
        } catch (e) {
          // JSON parsing failed - log warning but don't crash
          // IMPROVEMENT: Consider exposing parse errors to caller
          console.warn("⚠️ Failed to parse WebSocket message:", event.data);
        }
      };

      // Event handler: connection error occurred
      // NOTE: This fires for connection errors, NOT for errors after connection established
      this.ws.onerror = (err) => {
        console.warn("⚠️ WebSocket error on", this.url, err);
      };

      // Event handler: connection closed (normal close or error)
      // Implements automatic reconnection with linear backoff
      this.ws.onclose = () => {
        console.warn("🔌 WebSocket closed:", this.url);
        this.isConnected = false;

        // Retry logic: decrement retries and reconnect after delay
        // FRAGILE: Linear backoff (same delay between all retries)
        // FRAGILE: After retries exhausted, connection fails permanently
        if (retries > 0) {
          setTimeout(() => this.connect(retries - 1, delay), delay);
        }
      };
    } catch (err) {
      // Constructor threw error (likely invalid URL format)
      console.warn("❌ Failed to connect WebSocket:", this.url, err);
      this.isConnected = false;
    }
  }

  /**
   * Send typed message over WebSocket connection.
   *
   * Serializes message to JSON and sends over WebSocket if connection is open.
   * Performs dual connection checks for safety: isConnected flag AND WebSocket.readyState.
   *
   * **Safety Checks**:
   * 1. Check isConnected flag (manual state tracking)
   * 2. Check ws is not null (connection exists)
   * 3. Check WebSocket.readyState === OPEN (actual connection state)
   *
   * **FRAGILE: Dual State Checking**:
   * The dual check (isConnected flag + readyState) suggests the isConnected flag
   * may become out-of-sync with actual connection state. Consider refactoring to
   * use WebSocket.readyState as the single source of truth.
   *
   * **Current Usage in QUAlibrate**:
   * This method appears UNUSED in the current application - WebSockets are used
   * receive-only (server pushes data, frontend doesn't send). The send methods
   * in WebSocketContext.tsx (sendRunStatus, sendHistory) exist but are not called.
   *
   * @param data - Message to send. Must match type T and be JSON-serializable.
   *
   * @remarks
   * **Silently fails if connection not open** - returns early with console warning.
   * Check isOpen() before sending critical messages to detect failures.
   *
   * **No return value or error propagation** - callers cannot detect send failures.
   * Consider returning boolean success status or throwing errors for better error handling.
   *
   * **No message queuing** - messages sent while disconnected are lost permanently.
   * Consider implementing message queue to retry sending after reconnection.
   *
   * @see isOpen for checking connection state before sending
   * @see connect for establishing connection
   */
  send(data: T) {
    // Triple guard: manual flag, null check, and actual WebSocket state
    // FRAGILE: Suggests isConnected flag may be unreliable
    if (!this.isConnected || !this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.warn("❌ Cannot send message: WebSocket not connected:", this.url);
      return;
    }

    try {
      // Serialize to JSON string and send
      // FRAGILE: No validation that data is JSON-serializable
      // Will throw if data contains non-serializable values (functions, circular refs)
      this.ws.send(JSON.stringify(data));
    } catch (err) {
      // Serialization or send failed - log but don't propagate error
      console.warn("❌ Failed to send data over WebSocket:", err);
    }
  }

  /**
   * Gracefully close WebSocket connection and clean up resources.
   *
   * Closes the WebSocket connection, clears the connection instance, and resets
   * the isConnected flag. Does not clear subscribers (they persist for reconnection).
   *
   * **Cleanup Behavior**:
   * - Calls WebSocket.close() to initiate graceful shutdown
   * - Sets ws to null to allow garbage collection
   * - Sets isConnected to false
   * - Does NOT clear subscribers array (intentional for reconnection scenarios)
   *
   * **IMPORTANT: Stops Reconnection**:
   * After calling disconnect(), automatic reconnection will NOT occur even if
   * onclose handler fires. This is because the retries parameter is local to
   * the connect() method call stack. To reconnect, must call connect() again.
   *
   * @remarks
   * Safe to call when already disconnected (no-op if ws is null).
   * Does not unsubscribe callbacks - subscribers persist across disconnect/reconnect cycles.
   *
   * Typical usage: component unmount cleanup to prevent memory leaks.
   * See WebSocketContext.tsx useEffect cleanup function for example.
   *
   * @see connect for establishing new connection
   * @see isOpen for checking if disconnection was successful
   */
  disconnect() {
    if (this.ws) {
      // Close WebSocket connection gracefully
      // Triggers onclose handler, but automatic reconnection won't occur
      // because retries parameter is exhausted
      this.ws.close();

      // Clear reference to allow garbage collection
      this.ws = null;

      // Reset connection flag
      this.isConnected = false;
    }
    // No-op if already disconnected (ws is null)
  }

  /**
   * Register callback to receive WebSocket messages (pub/sub pattern).
   *
   * Adds callback to subscribers array. All subscribers are notified after
   * the primary onMessage callback when messages are received.
   *
   * **Callback Notification Order**:
   * 1. Primary onMessage callback (constructor parameter)
   * 2. All subscribers in registration order
   *
   * **FRAGILE: No Duplicate Prevention**:
   * Same callback can be registered multiple times, resulting in multiple
   * invocations per message. Consider using Set or checking for duplicates.
   *
   * **FRAGILE: Error Propagation**:
   * Uncaught errors in subscriber callbacks will propagate and may prevent
   * subsequent subscribers from being notified. Consider wrapping each callback
   * in try/catch for isolation.
   *
   * @param cb - Callback function to invoke on each message. Receives parsed message data.
   *
   * @remarks
   * Subscribers are NOT automatically unsubscribed on disconnect. They persist
   * across disconnect/reconnect cycles. Call unsubscribe() to remove.
   *
   * Callbacks are invoked synchronously in the onmessage event handler.
   * Long-running callbacks will block WebSocket message processing.
   *
   * @see unsubscribe for removing callbacks
   * @see connect for the message handling flow
   */
  subscribe(cb: (data: T) => void) {
    // FRAGILE: No duplicate check - same callback can be added multiple times
    this.subscribers.push(cb);
  }

  /**
   * Unregister callback from receiving WebSocket messages.
   *
   * Removes callback from subscribers array using reference equality.
   * If callback was registered multiple times, removes ALL instances.
   *
   * **Reference Equality**:
   * Uses strict equality (===) to match callbacks. Anonymous functions or
   * functions created in different scopes won't match even if identical code.
   *
   * @param cb - Callback function to remove (must be same reference as subscribed)
   *
   * @remarks
   * **Safe to call if callback not subscribed** - filter will return unchanged array.
   *
   * **Removes all instances** - if callback was subscribed multiple times
   * (due to lack of duplicate prevention), all instances are removed.
   *
   * **Performance consideration**: Uses Array.filter which creates a new array.
   * For high-frequency unsubscribe operations, consider using Set for O(1) removal.
   *
   * @see subscribe for adding callbacks
   */
  unsubscribe(cb: (data: T) => void) {
    // Filter creates new array without matching callbacks
    // FRAGILE: O(n) operation, consider Set for better performance
    this.subscribers = this.subscribers.filter((s) => s !== cb);
  }

  /**
   * Check if WebSocket connection is currently open.
   *
   * Returns the isConnected flag state. Note this is manually managed and
   * may not reflect the actual WebSocket connection state.
   *
   * **FRAGILE: Manual State Tracking**:
   * Returns the isConnected flag, which is manually set in connect()/disconnect().
   * This flag may become out-of-sync with WebSocket.readyState. The send() method
   * performs additional readyState check as a safety measure.
   *
   * **Potential Race Condition**:
   * isConnected is set to true in onopen handler, which fires asynchronously.
   * Calling isOpen() immediately after connect() may return false even if
   * connection will succeed shortly.
   *
   * @returns {boolean} True if connection is open, false otherwise
   *
   * @remarks
   * **IMPROVEMENT NEEDED**: Consider checking WebSocket.readyState directly:
   * ```typescript
   * isOpen(): boolean {
   *   return this.ws?.readyState === WebSocket.OPEN;
   * }
   * ```
   * This would provide accurate real-time connection state without manual tracking.
   *
   * @see connect for connection establishment
   * @see send for connection state checking before sending
   */
  isOpen(): boolean {
    // Returns manual flag, not actual WebSocket.readyState
    // FRAGILE: May be out-of-sync with actual connection state
    return this.isConnected;
  }
}
