import { useState } from 'react';
import api from '../services/api';
import { Flight, FlightSearchParams } from '../types/flight';

interface BackendSearchParams {
  departure_date: string;
  adults: number;
  children: number;
  infants: number;
  cabin_class: string;
  trip_type: string;
  origin?: string;
  destination?: string;
  return_date?: string;
}

export const useFlights = () => {
  const [flights, setFlights] = useState<Flight[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchFlights = async (params: FlightSearchParams) => {
    setLoading(true);
    setError(null);
    
    try {
      // Convert frontend params to backend format
      const backendParams: BackendSearchParams = {
        departure_date: params.departure_date,
        adults: params.adults,
        children: params.children,
        infants: params.infants,
        cabin_class: params.cabin_class,
        trip_type: params.trip_type
      };

      // Only add origin/destination if they are provided
      if (params.origin && params.destination) {
        backendParams.origin = params.origin;
        backendParams.destination = params.destination;
        backendParams.return_date = params.return_date;
      }

      const response = await api.get('/flights/search', { params: backendParams });
      console.log(response, "response");
      
      // Handle different response formats based on search type
      if (response.data.flights) {
        // Date-only search returns { flights: [...] }
        setFlights(response.data.flights || []);
      } else if (response.data.outbound || response.data.return) {
        // Route-specific search returns { outbound: [...], return: [...] }
        const outboundFlights = response.data.outbound || [];
        const returnFlights = response.data.return || [];
        const allFlights = [...outboundFlights, ...returnFlights];
        setFlights(allFlights);
      } else {
        setFlights([]);
      }
    } catch (error: unknown) {
      console.error('Flight search error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to search flights';
      setError(errorMessage);
      setFlights([]);
    } finally {
      setLoading(false);
    }
  };

  const getAllFlights = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.get('/flights');
      setFlights(response.data || []);
    } catch (error: unknown) {
      console.error('Get flights error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to get flights';
      setError(errorMessage);
      setFlights([]);
    } finally {
      setLoading(false);
    }
  };

  return {
    flights,
    loading,
    error,
    searchFlights,
    getAllFlights,
  };
}; 