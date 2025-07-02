export default class WebSocketService<T> {
  private ws: WebSocket | null = null;
  private readonly url: string;
  private isConnected: boolean = false;
  private readonly onMessage: (data: T) => void;
  private subscribers: ((data: T) => void)[] = [];

  constructor(url: string, onMessage: (data: T) => void) {
    this.url = url;
    this.onMessage = onMessage;
  }

  connect(retries = 5, delay = 1000) {
    if (this.isConnected) {
      console.warn("⚠️ WebSocket is already connected:", this.url);
      return;
    }

    try {
      this.ws = new WebSocket(this.url);

      this.ws.onopen = () => {
        this.isConnected = true;
        console.log("✅ WebSocket connected:", this.url);
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data) as T;
          this.onMessage(data);
          this.subscribers.forEach((cb) => cb(data));
        } catch (e) {
          console.warn("⚠️ Failed to parse WebSocket message:", event.data);
        }
      };

      this.ws.onerror = (err) => {
        console.warn("⚠️ WebSocket error on", this.url, err);
      };

      this.ws.onclose = () => {
        console.warn("🔌 WebSocket closed:", this.url);
        this.isConnected = false;

        if (retries > 0) {
          setTimeout(() => this.connect(retries - 1, delay), delay);
        }
      };
    } catch (err) {
      console.warn("❌ Failed to connect WebSocket:", this.url, err);
      this.isConnected = false;
    }
  }

  send(data: T) {
    if (!this.isConnected || !this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.warn("❌ Cannot send message: WebSocket not connected:", this.url);
      return;
    }

    try {
      this.ws.send(JSON.stringify(data));
    } catch (err) {
      console.warn("❌ Failed to send data over WebSocket:", err);
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
      this.isConnected = false;
    }
  }

  subscribe(cb: (data: T) => void) {
    this.subscribers.push(cb);
  }

  unsubscribe(cb: (data: T) => void) {
    this.subscribers = this.subscribers.filter((s) => s !== cb);
  }

  isOpen(): boolean {
    return this.isConnected;
  }
}
