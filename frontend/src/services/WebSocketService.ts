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
 * - Automatic reconnection every second until the server becomes available again
 * - Pub/sub pattern allowing multiple callbacks per WebSocket connection
 * - JSON serialization/deserialization of all messages
 * - Robust connection state tracking with 5-state state machine (ConnectionState enum)
 *
 * **Architecture Pattern**:
 * The service implements a facade pattern over the native WebSocket API, adding
 * resilience features (reconnection) and developer experience improvements (pub/sub,
 * type safety) without requiring changes to consuming code.
 *
 * **RECENT IMPROVEMENTS**:
 * - **State Tracking**: Replaced manual boolean flag with ConnectionState enum for accurate state tracking
 *
 * **REMAINING AREAS FOR IMPROVEMENT**:
 * 1. **Reconnection Strategy**: Constant 1s retries without jitter can cause thundering herd patterns
 * 2. **Retry Telemetry**: No built-in analytics for how long a reconnect cycle has been running
 * 3. **Error Handling**: Console-only logging, no user-facing error notifications
 * 4. **Subscriber Errors**: Uncaught errors in subscribers can affect other subscribers
 * 5. **No Runtime Type Validation**: Type safety is compile-time only
 *
 * @see WebSocketContext for React integration and provider implementation
 * @see WS_GET_STATUS and WS_EXECUTION_HISTORY for WebSocket endpoint routes
 */

/**
 * WebSocket connection state machine.
 *
 * **State Transitions**:
 * - DISCONNECTED → CONNECTING: connect() called
 * - CONNECTING → CONNECTED: WebSocket onopen event fires
 * - CONNECTING → FAILED: Connection attempt fails (onclose during CONNECTING)
 * - CONNECTED → FAILED: Unexpected disconnection (onclose during CONNECTED)
 * - FAILED → RECONNECTING: Automatic retry initiated
 * - RECONNECTING → CONNECTING: Retry attempt starts
 * - ANY_STATE → DISCONNECTED: disconnect() called (manual shutdown)
 *
 * **State Meanings**:
 * - DISCONNECTED: Initial state, no connection exists or manually disconnected
 * - CONNECTING: Connection attempt in progress (waiting for onopen)
 * - CONNECTED: Successfully connected and ready to send/receive messages
 * - RECONNECTING: Waiting to retry after connection failure
 * - FAILED: Connection attempt failed, either retrying or exhausted retries
 */
enum ConnectionState {
  DISCONNECTED = "disconnected",
  CONNECTING = "connecting",
  CONNECTED = "connected",
  RECONNECTING = "reconnecting",
  FAILED = "failed",
}

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
 * **Connection State Management**:
 * Uses a 5-state state machine (ConnectionState enum) for accurate connection tracking:
 * - DISCONNECTED: Initial state or manually disconnected
 * - CONNECTING: Connection attempt in progress
 * - CONNECTED: Successfully connected and ready
 * - RECONNECTING: Waiting to retry after failure
 * - FAILED: Connection failed (may retry or be exhausted)
 *
 * The isConnected() method provides dual verification by checking both the internal
 * ConnectionState and the actual WebSocket.readyState for maximum reliability.
 *
 * **REMAINING LIMITATIONS**:
 * Continuous 1s retries may overwhelm unstable networks or servers during outages.
 * Consider introducing jitter or a maximum delay cap, and exposing retry telemetry
 * to users when connection issues persist.
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
   * Current connection state using state machine pattern.
   *
   * Tracks the connection lifecycle through 5 distinct states:
   * - DISCONNECTED: No connection, initial state
   * - CONNECTING: Connection attempt in progress
   * - CONNECTED: Successfully connected and operational
   * - RECONNECTING: Waiting before retry attempt
   * - FAILED: Connection attempt failed
   *
   * This replaces the previous boolean isConnected flag to provide more
   * granular state information and eliminate synchronization issues with
   * WebSocket.readyState.
   *
   * @private
   */
  private connectionState: ConnectionState = ConnectionState.DISCONNECTED;

  private reconnectAttempt = 0;
  private shouldReconnect = true;
  private reconnectTimeoutId: ReturnType<typeof setTimeout> | null = null;
  private retryDelay = 1000;

  /**
   * Primary message callback provided during construction.
   * Called for every message received, before notifying subscribers.
   * @private
   * @readonly
   */
  private readonly onMessage: (data: T) => void;

  /**
   * Primary callback when the connection is established.
   * Called every time connection is established.
   * @private
   * @readonly
   */
  private readonly onConnected?: () => void;

  /**
   * Primary callback when the connection is closed.
   * Called every time connection is closed.
   * @private
   * @readonly
   */
  private readonly onClose?: () => void;

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
  constructor(url: string, onMessage: (data: T) => void, onConnected?: () => void, onClose?: () => void) {
    this.url = url;
    this.onMessage = onMessage;
    this.onConnected = onConnected;
    this.onClose = onClose;
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
   * 5. On connection close, retry automatically after a short delay
   *
   * **Reconnection Behavior**:
   * - Attempts to reconnect indefinitely
   * - Uses a fixed one second delay between attempts (no exponential backoff)
   * - Logs each retry to the console for visibility
   *
   * **Error Handling**:
   * - Constructor errors caught and logged (connection attempt failures)
   * - Message parsing errors caught in onmessage handler (invalid JSON)
   * - All errors only log to console, no user-facing notifications
   * - No distinction between recoverable vs permanent failures
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
  connect(retryDelay: number = 1000) {
    if (this.connectionState === ConnectionState.CONNECTED) {
      console.warn("⚠️ WebSocket is already connected:", this.url);
      return;
    }

    this.shouldReconnect = true;
    this.reconnectAttempt = 0;
    this.retryDelay = retryDelay;
    this.clearReconnectTimeout();
    this.tryConnect();
  }

  /**
   * Send typed message over WebSocket connection.
   *
   * Serializes message to JSON and sends over WebSocket if connection is open.
   * Uses isConnected() method which performs dual verification of both internal
   * state and WebSocket.readyState for maximum reliability.
   *
   * **Safety Checks**:
   * The isConnected() method verifies:
   * 1. Internal connectionState === CONNECTED
   * 2. WebSocket instance exists and readyState === OPEN
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
   * Check isConnected() before sending critical messages to detect failures.
   *
   * **No return value or error propagation** - callers cannot detect send failures.
   * Consider returning boolean success status or throwing errors for better error handling.
   *
   * **No message queuing** - messages sent while disconnected are lost permanently.
   * Consider implementing message queue to retry sending after reconnection.
   *
   * @see isConnected for checking connection state before sending
   * @see connect for establishing connection
   */
  send(data: T) {
    // Use isConnected() for reliable connection check
    if (!this.isConnected()) {
      console.warn("❌ Cannot send message: WebSocket not connected:", this.url);
      return;
    }

    try {
      // Serialize to JSON string and send
      // FRAGILE: No validation that data is JSON-serializable
      // Will throw if data contains non-serializable values (functions, circular refs)
      this.ws!.send(JSON.stringify(data));
    } catch (err) {
      // Serialization or send failed - log but don't propagate error
      console.warn("❌ Failed to send data over WebSocket:", err);
    }
  }

  /**
   * Gracefully close WebSocket connection and clean up resources.
   *
   * Closes the WebSocket connection, clears the connection instance, and sets
   * state to DISCONNECTED. Does not clear subscribers (they persist for reconnection).
   *
   * **Cleanup Behavior**:
   * - Calls WebSocket.close() to initiate graceful shutdown
   * - Sets ws to null to allow garbage collection
   * - Sets connectionState to DISCONNECTED
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
   * @see isConnected for checking connection state
   * @see getConnectionState for detailed state information
   */
  disconnect() {
    this.shouldReconnect = false;
    this.clearReconnectTimeout();
    this.reconnectAttempt = 0;

    if (this.ws) {
      const socket = this.ws;
      socket.close();
      this.ws = null;
    }
    this.connectionState = ConnectionState.DISCONNECTED;
  }

  /**
   * Subscribe to WebSocket messages.
   *
   * Adds callback to subscribers array with duplicate prevention.
   * All subscribers are notified after the primary onMessage callback
   * when messages are received.
   *
   * **Callback Notification Order**:
   * 1. Primary onMessage callback (constructor parameter)
   * 2. All subscribers in registration order
   *
   * **Duplicate Prevention**:
   * Same callback reference will not be registered multiple times.
   * Uses reference equality (===) for duplicate detection.
   *
   * **Error Isolation**:
   * Errors thrown in subscriber callbacks are caught and logged, preventing
   * them from affecting other subscribers. Each subscriber is isolated in its
   * own try-catch block. Errors are logged to console.error.
   *
   * @param cb - Callback function to invoke on each message. Receives parsed message data.
   * @returns Unsubscribe function for convenience (modern pattern)
   *
   * @remarks
   * **New Pattern (Use this)**:
   * ```typescript
   * const unsubscribe = ws.subscribe((data) => console.log(data));
   * // Later...
   * unsubscribe();
   * ```
   *
   * **Legacy Pattern (Don't use)**:
   * ```typescript
   * const callback = (data) => console.log(data);
   * ws.subscribe(callback);
   * // Later...
   * ws.unsubscribe(callback);
   * ```
   *
   * Subscribers persist across disconnect/reconnect cycles unless explicitly
   * unsubscribed via the returned function or unsubscribe() method.
   *
   * Callbacks are invoked synchronously in the onmessage event handler.
   * Long-running callbacks will block WebSocket message processing.
   *
   * @see connect for the message handling flow
   */
  subscribe(cb: (data: T) => void): () => void {
    // Check for duplicates to prevent double-subscription
    if (!this.subscribers.includes(cb)) {
      this.subscribers.push(cb);
    }

    // Return unsubscribe function for convenience
    return () => {
      this.subscribers = this.subscribers.filter((s) => s !== cb);
    };
  }

  /**
   * Get current connection state.
   *
   * Returns the current ConnectionState enum value, providing granular
   * information about the connection lifecycle.
   *
   * **Use Cases**:
   * - UI status indicators showing connection state
   * - Conditional logic based on connection phase
   * - Debugging connection issues
   * - Monitoring reconnection attempts
   *
   * @returns {ConnectionState} Current connection state (one of 5 enum values)
   *
   * @remarks
   * Prefer this method over isConnected() when you need detailed state information.
   * Use isConnected() when you only need to know if messages can be sent/received.
   *
   * **State meanings**:
   * - DISCONNECTED: No connection, can call connect()
   * - CONNECTING: Connection attempt in progress
   * - CONNECTED: Ready to send/receive messages
   * - RECONNECTING: Waiting before retry attempt
   * - FAILED: Connection failed (may be retrying or exhausted)
   *
   * @see isConnected for simple boolean connection check
   * @see ConnectionState enum for state definitions
   */
  getConnectionState(): ConnectionState {
    return this.connectionState;
  }

  /**
   * Check if WebSocket is connected and ready to send messages.
   *
   * Performs dual verification for maximum reliability:
   * 1. Checks internal connectionState === CONNECTED
   * 2. Verifies actual WebSocket.readyState === OPEN
   *
   * This eliminates the previous risk of state desynchronization between
   * the manual isConnected flag and the actual WebSocket state.
   *
   * **Use Cases**:
   * - Check before calling send() to avoid errors
   * - Conditional UI rendering based on connectivity
   * - Guard conditions for WebSocket-dependent operations
   *
   * @returns {boolean} True if connected and ready, false otherwise
   *
   * @remarks
   * This method provides a reliable boolean check for "can I send messages now?"
   * Use getConnectionState() if you need more detailed state information.
   *
   * **Dual Check Benefits**:
   * - Catches cases where WebSocket closed but state not yet updated
   * - Catches cases where state updated but WebSocket not yet open
   * - Provides defense-in-depth against edge cases
   *
   * @see getConnectionState for detailed state information
   * @see send for message sending (which uses this method)
   */
  isConnected(): boolean {
    return this.connectionState === ConnectionState.CONNECTED && this.ws?.readyState === WebSocket.OPEN;
  }

  private tryConnect() {
    if (!this.shouldReconnect) {
      this.connectionState = ConnectionState.DISCONNECTED;
      return;
    }

    this.connectionState = ConnectionState.CONNECTING;

    try {
      this.ws = new WebSocket(this.url);

      this.ws.onopen = () => {
        this.connectionState = ConnectionState.CONNECTED;
        this.reconnectAttempt = 0;
        this.clearReconnectTimeout();
        console.log("✅ WebSocket connected:", this.url);
        if (this.onConnected) {
          this.onConnected();
        }
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data) as T;
          this.onMessage(data);
          this.subscribers.forEach((cb) => {
            try {
              cb(data);
            } catch (error) {
              console.error("❌ Error in WebSocket subscriber:", error);
            }
          });
        } catch (e) {
          console.warn("⚠️ Failed to parse WebSocket message:", event.data, e);
        }
      };

      this.ws.onerror = (err) => {
        console.warn("⚠️ WebSocket error on", this.url, err);
      };

      this.ws.onclose = () => {
        this.ws = null;
        this.clearReconnectTimeout();

        if (!this.shouldReconnect || this.connectionState === ConnectionState.DISCONNECTED) {
          this.connectionState = ConnectionState.DISCONNECTED;
          return;
        }

        console.warn("🔌 WebSocket closed:", this.url);
        this.connectionState = ConnectionState.FAILED;
        if (this.onClose) {
          this.onClose();
        }
        this.scheduleReconnect();
      };
    } catch (err) {
      console.warn("❌ Failed to connect WebSocket:", this.url, err);
      this.connectionState = ConnectionState.FAILED;
      this.scheduleReconnect();
    }
  }

  private clearReconnectTimeout() {
    if (this.reconnectTimeoutId !== null) {
      clearTimeout(this.reconnectTimeoutId);
      this.reconnectTimeoutId = null;
    }
  }

  private scheduleReconnect() {
    if (!this.shouldReconnect) {
      this.connectionState = ConnectionState.DISCONNECTED;
      return;
    }

    this.connectionState = ConnectionState.RECONNECTING;
    const delayMs = this.retryDelay;
    console.warn(`⏳ Attempting to reconnect to ${this.url} in ${delayMs}ms (attempt ${this.reconnectAttempt + 1})`);
    this.reconnectAttempt += 1;
    this.reconnectTimeoutId = setTimeout(() => {
      this.reconnectTimeoutId = null;
      this.tryConnect();
    }, delayMs);
  }
}
