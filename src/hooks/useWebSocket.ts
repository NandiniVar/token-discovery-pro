import { useState, useEffect, useCallback, useRef } from 'react';

interface WebSocketConfig {
  url: string;
  onMessage?: (data: any) => void;
  onError?: (error: Event) => void;
  onOpen?: (event: Event) => void;
  onClose?: (event: CloseEvent) => void;
  reconnectAttempts?: number;
  reconnectInterval?: number;
}

interface WebSocketReturn {
  send: (data: any) => void;
  lastMessage: any;
  readyState: number;
  isConnected: boolean;
  isConnecting: boolean;
  error: Event | null;
}

export function useWebSocket({
  url,
  onMessage,
  onError,
  onOpen,
  onClose,
  reconnectAttempts = 3,
  reconnectInterval = 3000,
}: WebSocketConfig): WebSocketReturn {
  const [lastMessage, setLastMessage] = useState<any>(null);
  const [readyState, setReadyState] = useState<number>(WebSocket.CONNECTING);
  const [error, setError] = useState<Event | null>(null);
  const ws = useRef<WebSocket | null>(null);
  const reconnectCount = useRef(0);
  const reconnectTimeoutId = useRef<NodeJS.Timeout>();

  const connect = useCallback(() => {
    try {
      ws.current = new WebSocket(url);
      setReadyState(WebSocket.CONNECTING);
      setError(null);

      ws.current.onopen = (event) => {
        setReadyState(WebSocket.OPEN);
        reconnectCount.current = 0;
        onOpen?.(event);
      };

      ws.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          setLastMessage(data);
          onMessage?.(data);
        } catch (err) {
          console.error('Failed to parse WebSocket message:', err);
        }
      };

      ws.current.onerror = (event) => {
        setError(event);
        onError?.(event);
      };

      ws.current.onclose = (event) => {
        setReadyState(WebSocket.CLOSED);
        onClose?.(event);

        // Attempt to reconnect if not explicitly closed
        if (!event.wasClean && reconnectCount.current < reconnectAttempts) {
          reconnectCount.current++;
          reconnectTimeoutId.current = setTimeout(() => {
            console.log(`Attempting to reconnect... (${reconnectCount.current}/${reconnectAttempts})`);
            connect();
          }, reconnectInterval);
        }
      };
    } catch (err) {
      console.error('Failed to create WebSocket connection:', err);
    }
  }, [url, onMessage, onError, onOpen, onClose, reconnectAttempts, reconnectInterval]);

  const send = useCallback((data: any) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(data));
    } else {
      console.warn('WebSocket is not connected');
    }
  }, []);

  useEffect(() => {
    connect();

    return () => {
      if (reconnectTimeoutId.current) {
        clearTimeout(reconnectTimeoutId.current);
      }
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [connect]);

  return {
    send,
    lastMessage,
    readyState,
    isConnected: readyState === WebSocket.OPEN,
    isConnecting: readyState === WebSocket.CONNECTING,
    error,
  };
}