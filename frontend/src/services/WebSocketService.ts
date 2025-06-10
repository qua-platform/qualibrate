export default class WebSocketService {
  private ws: WebSocket | null = null;
  private readonly url: string;
  private readonly onMessage: (data: unknown) => void;
  private subscribers: ((data: unknown) => void)[] = [];

  constructor(url: string, onMessage: (data: unknown) => void) {
    this.url = url;
    this.onMessage = onMessage;
  }

  connect() {
    try {
      this.ws = new WebSocket(this.url);

      this.ws.onopen = () => {
        console.log("WebSocket connected:", this.url);
      };

      this.ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        this.onMessage(data);
        this.subscribers.forEach((cb) => cb(data));
      };

      this.ws.onerror = (err) => {
        console.warn("⚠️ WebSocket error on", this.url, err);
      };

      this.ws.onclose = () => {
        console.warn("🔌 WebSocket closed:", this.url);
      };
    } catch (err) {
      console.warn("❌ Failed to connect WebSocket:", this.url, err);
    }
  }

  send(data: unknown) {
    try {
      this.ws?.send(JSON.stringify(data));
    } catch (err) {
      console.warn("❌ Failed to send data over WebSocket:", err);
    }
  }

  disconnect() {
    this.ws?.close();
  }

  subscribe(cb: (data: unknown) => void) {
    this.subscribers.push(cb);
  }

  unsubscribe(cb: (data: unknown) => void) {
    this.subscribers = this.subscribers.filter((s) => s !== cb);
  }
}
