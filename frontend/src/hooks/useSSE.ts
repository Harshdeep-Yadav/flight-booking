import { useEffect, useRef, useState, useCallback } from 'react';
import axios from 'axios';

export interface SSEEvent {
  type: 'flight_update' | 'booking_update' | 'connection' | 'heartbeat';
  data?: FlightStatus | BookingUpdate | { message: string };
  timestamp: string;
}

export interface FlightStatus {
  id: string;
  flight_number: string;
  status: 'scheduled' | 'boarding' | 'in_flight' | 'completed' | 'delayed' | 'cancelled';
  departure_time: string;
  arrival_time: string;
  current_time: string;
}

export interface BookingUpdate {
  id: string;
  status: string;
  updated_at: string;
}

export function useSSE(url: string, options?: {
  onFlightUpdate?: (flight: FlightStatus) => void;
  onBookingUpdate?: (booking: BookingUpdate) => void;
  onConnection?: () => void;
  onError?: (error: Event) => void;
  autoReconnect?: boolean;
  reconnectInterval?: number;
}) {
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    onFlightUpdate,
    onBookingUpdate,
    onConnection,
    onError,
    autoReconnect = true,
    reconnectInterval = 5000
  } = options || {};

  const connect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    try {
      eventSourceRef.current = new EventSource(url);

      eventSourceRef.current.onopen = () => {
        setIsConnected(true);
        setError(null);
        onConnection?.();
      };

      eventSourceRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          const sseEvent: SSEEvent = {
            type: data.type,
            data: data.data,
            timestamp: data.timestamp || new Date().toISOString()
          };

          // Handle specific event types
          switch (sseEvent.type) {
            case 'flight_update':
              if (onFlightUpdate && sseEvent.data) {
                onFlightUpdate(sseEvent.data as FlightStatus);
              }
              break;
            case 'booking_update':
              if (onBookingUpdate && sseEvent.data) {
                onBookingUpdate(sseEvent.data as BookingUpdate);
              }
              break;
            case 'connection':
              console.log('SSE Connected:', (sseEvent.data as { message: string })?.message);
              break;
            case 'heartbeat':
              // Optional: Handle heartbeat for connection monitoring
              break;
          }
        } catch (parseError) {
          console.error('Failed to parse SSE message:', parseError);
        }
      };

      eventSourceRef.current.onerror = (event) => {
        setIsConnected(false);
        setError('SSE connection error');
        onError?.(event);

        // Auto-reconnect logic
        if (autoReconnect && eventSourceRef.current?.readyState === EventSource.CLOSED) {
          if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
          }
          reconnectTimeoutRef.current = setTimeout(() => {
            console.log('Attempting to reconnect to SSE...');
            connect();
          }, reconnectInterval);
        }
      };
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create SSE connection');
    }
  }, [url, onFlightUpdate, onBookingUpdate, onConnection, onError, autoReconnect, reconnectInterval]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }

    setIsConnected(false);
  }, []);

  const reconnect = useCallback(() => {
    disconnect();
    setTimeout(connect, 1000);
  }, [connect, disconnect]);

  useEffect(() => {
    connect();

    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return {
    isConnected,
    error,
    reconnect,
    disconnect
  };
}

// Specialized hook for flight status updates
export function useFlightStatusSSE(flightId?: string) {
  const [flightStatus, setFlightStatus] = useState<FlightStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const sseUrl = flightId 
    ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/sse/flight-status/${flightId}`
    : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/sse/flight-status`;

  const { isConnected, error, reconnect } = useSSE(sseUrl, {
    onFlightUpdate: (flight) => {
      setFlightStatus(flight);
      setIsLoading(false);
    },
    onConnection: () => {
      setIsLoading(false);
    },
    onError: () => {
      setIsLoading(false);
    },
    autoReconnect: true,
    reconnectInterval: 3000
  });

  // Fetch initial status if flightId is provided
  useEffect(() => {
    if (flightId) {
      setIsLoading(true);
      axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/sse/flight-status/${flightId}`)
        .then(res => res.data)
        .then(data => {
          setFlightStatus(data);
          setIsLoading(false);
        })
        .catch(err => {
          console.error('Failed to fetch initial flight status:', err);
          setIsLoading(false);
        });
    }
  }, [flightId]);

  return {
    flightStatus,
    isLoading,
    isConnected,
    error,
    reconnect
  };
}

// Specialized hook for booking updates
export function useBookingUpdatesSSE() {
  const [bookingUpdates, setBookingUpdates] = useState<BookingUpdate[]>([]);

  const sseUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/sse/booking-updates`;

  const { isConnected, error, reconnect } = useSSE(sseUrl, {
    onBookingUpdate: (booking) => {
      setBookingUpdates(prev => [booking, ...prev.slice(0, 9)]); // Keep last 10 updates
    },
    autoReconnect: true,
    reconnectInterval: 3000
  });

  return {
    bookingUpdates,
    isConnected,
    error,
    reconnect
  };
} 