/**
 * Alarm WebSocket Service
 * ========================
 *
 * Real-time WebSocket service for alarm notifications and updates.
 * Provides automatic reconnection, event subscription, and message handling.
 *
 * Features:
 * - Automatic connection management with reconnection strategy
 * - Event-based subscription system
 * - Message type routing (ALARM_TRIGGERED, ALARM_UPDATED, ALARM_RESOLVED)
 * - Connection status monitoring
 * - Error handling and logging
 *
 * @author Chang Xiu-Wen, AI-Enhanced
 * @since 2025/10/02
 */

interface WebSocketMessage {
  type: "ALARM_TRIGGERED" | "ALARM_UPDATED" | "ALARM_RESOLVED";
  data: any;
  timestamp: string;
}

interface WebSocketOptions {
  maxReconnectAttempts?: number;
  reconnectInterval?: number;
  heartbeatInterval?: number;
}

export class AlarmWebSocketService {
  private ws: WebSocket | null = null;
  private reconnectTimer: number | null = null;
  private heartbeatTimer: number | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts: number;
  private reconnectInterval: number;
  private heartbeatInterval: number;
  private callbacks: Map<string, ((...args: any[]) => void)[]> = new Map();
  private url: string;
  private isConnecting = false;

  constructor(options: WebSocketOptions = {}) {
    this.maxReconnectAttempts = options.maxReconnectAttempts || 3;
    this.reconnectInterval = options.reconnectInterval || 5000;
    this.heartbeatInterval = options.heartbeatInterval || 30000;
    this.url = this.getWebSocketUrl();
  }

  /**
   * Get WebSocket URL based on current environment
   */
  private getWebSocketUrl(): string {
    // Check if explicit WebSocket endpoint is configured
    const wsEndpoint = import.meta.env.VITE_APP_WS_ENDPOINT;
    if (wsEndpoint) {
      return `${wsEndpoint}/alarms`;
    }

    // Fallback to constructing URL from current location and API URL
    const apiUrl = import.meta.env.VITE_APP_API_URL;
    if (apiUrl) {
      // Parse API URL to get host and protocol
      try {
        const url = new URL(apiUrl);
        const protocol = url.protocol === "https:" ? "wss:" : "ws:";
        return `${protocol}//${url.host}/ws/alarms`;
      } catch (error) {
        console.warn("Failed to parse API URL, falling back to current host:", error);
      }
    }

    // Final fallback to current location
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    return `${protocol}//${window.location.host}/ws/alarms`;
  }

  /**
   * Connect to WebSocket server
   */
  connect(): void {
    if (this.isConnecting || this.isConnected()) {
      return;
    }

    this.isConnecting = true;

    try {
      console.log("Connecting to Alarm WebSocket:", this.url);
      this.ws = new WebSocket(this.url);

      this.ws.onopen = () => {
        console.log("Alarm WebSocket connected successfully");
        this.isConnecting = false;
        this.reconnectAttempts = 0;
        this.startHeartbeat();
        this.emit("connected");
      };

      this.ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          this.handleMessage(message);
        } catch (error) {
          console.error("Failed to parse WebSocket message:", error);
        }
      };

      this.ws.onclose = (event) => {
        console.log("Alarm WebSocket disconnected:", event.code, event.reason);
        this.isConnecting = false;
        this.stopHeartbeat();
        this.emit("disconnected", { code: event.code, reason: event.reason });
        this.scheduleReconnect();
      };

      this.ws.onerror = (error) => {
        console.error("Alarm WebSocket error:", error);
        this.isConnecting = false;
        this.emit("error", error);
      };
    } catch (error) {
      console.error("Failed to create WebSocket connection:", error);
      this.isConnecting = false;
      this.scheduleReconnect();
    }
  }

  /**
   * Disconnect from WebSocket server
   */
  disconnect(): void {
    this.stopReconnect();
    this.stopHeartbeat();

    if (this.ws) {
      this.ws.close(1000, "Manual disconnect");
      this.ws = null;
    }
  }

  /**
   * Check if WebSocket is connected
   */
  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  /**
   * Handle incoming WebSocket messages
   */
  private handleMessage(message: WebSocketMessage): void {
    console.log("Received alarm WebSocket message:", message);

    switch (message.type) {
      case "ALARM_TRIGGERED":
        this.emit("alarmTriggered", message.data);
        break;
      case "ALARM_UPDATED":
        this.emit("alarmUpdated", message.data);
        break;
      case "ALARM_RESOLVED":
        this.emit("alarmResolved", message.data);
        break;
      default:
        console.warn("Unknown message type:", message.type);
    }

    // Emit general message event
    this.emit("message", message);
  }

  /**
   * Schedule reconnection attempt
   */
  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.warn(
        `Max reconnect attempts (${this.maxReconnectAttempts}) reached, WebSocket service disabled until manual reconnect`
      );
      this.emit("maxReconnectAttemptsReached");
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectInterval * Math.pow(2, this.reconnectAttempts - 1);

    console.log(`Scheduling reconnect attempt ${this.reconnectAttempts} in ${delay}ms`);

    this.reconnectTimer = window.setTimeout(() => {
      this.connect();
    }, delay);
  }

  /**
   * Stop reconnection attempts
   */
  private stopReconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  /**
   * Start heartbeat mechanism
   */
  private startHeartbeat(): void {
    this.heartbeatTimer = window.setInterval(() => {
      if (this.isConnected()) {
        try {
          this.ws?.send(JSON.stringify({ type: "ping" }));
        } catch (error) {
          console.error("Failed to send heartbeat:", error);
        }
      }
    }, this.heartbeatInterval);
  }

  /**
   * Stop heartbeat mechanism
   */
  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  /**
   * Subscribe to events
   */
  subscribe(event: string, callback: (...args: any[]) => void): () => void {
    if (!this.callbacks.has(event)) {
      this.callbacks.set(event, []);
    }
    this.callbacks.get(event)!.push(callback);

    // Return unsubscribe function
    return () => {
      const callbacks = this.callbacks.get(event);
      if (callbacks) {
        const index = callbacks.indexOf(callback);
        if (index > -1) {
          callbacks.splice(index, 1);
        }
      }
    };
  }

  /**
   * Unsubscribe from events
   */
  unsubscribe(event: string, callback?: (...args: any[]) => void): void {
    if (!callback) {
      this.callbacks.delete(event);
      return;
    }

    const callbacks = this.callbacks.get(event);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  /**
   * Emit events to subscribers
   */
  private emit(event: string, data?: any): void {
    const callbacks = this.callbacks.get(event);
    if (callbacks) {
      callbacks.forEach((callback) => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in ${event} callback:`, error);
        }
      });
    }
  }

  /**
   * Get connection status
   */
  getStatus(): {
    connected: boolean;
    connecting: boolean;
    reconnectAttempts: number;
  } {
    return {
      connected: this.isConnected(),
      connecting: this.isConnecting,
      reconnectAttempts: this.reconnectAttempts,
    };
  }
}

// Create singleton instance
export const alarmWebSocketService = new AlarmWebSocketService();

// Auto-connect when module is imported (only in production or when WS endpoint is explicitly set)
if (typeof window !== "undefined") {
  const wsEndpoint = import.meta.env.VITE_APP_WS_ENDPOINT;
  const isProduction = import.meta.env.PROD;

  if (isProduction || wsEndpoint) {
    // Connect after a short delay to allow app initialization
    setTimeout(() => {
      alarmWebSocketService.connect();
    }, 2000);
  } else {
    console.log("WebSocket auto-connect disabled in development mode without explicit endpoint");
  }
}
