/**
 * @fileoverview WebSocket client with automatic reconnection and pub/sub pattern.
 *
 * Used by WebSocketContext for two connections: run status and execution history.
 * Auto-reconnects every second until server available.
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
 * @see WebSocketContext
 */

/** WebSocket lifecycle states. Auto-reconnects on failure. */
enum ConnectionState {
  DISCONNECTED = "disconnected",
  CONNECTING = "connecting",
  CONNECTED = "connected",
  RECONNECTING = "reconnecting",
  FAILED = "failed",
}

/**
 * WebSocket client with automatic reconnection and pub/sub pattern.
 * Messages must be JSON-serializable.
 *
 * @template T - Message type for this connection
 * @see WebSocketContext
 */
export default class WebSocketService<T> {
  private ws: WebSocket | null = null;
  private readonly url: string;
  private connectionState: ConnectionState = ConnectionState.DISCONNECTED;
  private reconnectAttempt = 0;
  private shouldReconnect = true;
  private reconnectTimeoutId: ReturnType<typeof setTimeout> | null = null;
  private retryDelay = 1000;
  private readonly onMessage: (data: T) => void;
  private readonly onConnected?: () => void;
  private readonly onClose?: () => void;
  private subscribers: ((data: T) => void)[] = [];

  /**
   * @param url - WebSocket URL
   * @param onMessage - Callback for received messages
   * @param onConnected - Optional callback when connection established
   * @param onClose - Optional callback when connection closed
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
   * Connect to WebSocket with automatic reconnection.
   *
   * @param retryDelay - Milliseconds between reconnection attempts (default: 1000)
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
   * Send message over WebSocket. Silently fails if not connected.
   * @param data - Message to send (must be JSON-serializable)
   */
  send(data: T) {
    if (!this.isConnected()) {
      console.warn("❌ Cannot send message: WebSocket not connected:", this.url);
      return;
    }

    try {
      this.ws!.send(JSON.stringify(data));
    } catch (err) {
      console.warn("❌ Failed to send data over WebSocket:", err);
    }
  }

  /** Disconnect and stop auto-reconnection. Subscribers persist. */
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
   * @param cb - Callback invoked on each message
   * @returns Unsubscribe function
   */
  subscribe(cb: (data: T) => void): () => void {
    if (!this.subscribers.includes(cb)) {
      this.subscribers.push(cb);
    }

    return () => {
      this.subscribers = this.subscribers.filter((s) => s !== cb);
    };
  }

  getConnectionState(): ConnectionState {
    return this.connectionState;
  }

  /** Check if connected and ready to send/receive messages. */
  isConnected(): boolean {
    return this.connectionState === ConnectionState.CONNECTED && this.ws?.readyState === WebSocket.OPEN;
  }

  private tryConnect() {
    if (!this.shouldReconnect) {this.connectionState = ConnectionState.DISCONNECTED;
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
