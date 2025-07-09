import { useState, useCallback } from 'react';
import api from '../services/api';

export interface Booking {
  id: string;
  user_id: string;
  flight_id: string;
  passenger_count: number;
  total_price: number;
  status: 'confirmed' | 'cancelled' | 'pending';
  created_at: string;
  flights?: {
    id: string;
    flight_number: string;
    airline: string;
    origin: string;
    destination: string;
    departure_time: string;
    arrival_time: string;
    price: number;
  };
}

export interface Passenger {
  first_name: string;
  last_name: string;
  date_of_birth: string;
  passport_number?: string;
  type: 'adult' | 'child' | 'infant';
}

export const useBookings = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getUserBookings = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.get('/bookings/user');
      console.log(response.data.bookings,"2123")
      setBookings(response.data.bookings || []);
    } catch (error: unknown) {
      console.error('Get bookings error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to get bookings';
      setError(errorMessage);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const createBooking = useCallback(async (bookingData: {
    flight_id: string;
    passenger_info: Passenger[];
    passenger_count: number;
    total_price: number;
    trip_type?: string;
  }) => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Creating booking with data:', bookingData);
      
      await api.post('/bookings', bookingData);
      
      console.log('Booking created successfully');
      
      // Refresh user bookings after successful booking
      await getUserBookings();
      
      return { 
        success: true
      };
    } catch (error: unknown) {
      console.error('Create booking error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create booking';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [getUserBookings]);

  const cancelBooking = useCallback(async (bookingId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      await api.put(`/bookings/${bookingId}/cancel`);
      // Refresh bookings after cancellation
      await getUserBookings();
      return { success: true };
    } catch (error: unknown) {
      console.error('Cancel booking error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to cancel booking';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [getUserBookings]);

  return {
    bookings,
    loading,
    error,
    getUserBookings,
    createBooking,
    cancelBooking,
  };
}; 