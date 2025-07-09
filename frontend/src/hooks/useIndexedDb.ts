import { useState, useEffect, useCallback } from 'react';
import { flightBookingDB } from '../indexedDb/database';
import { Flight } from '../types/flight';
import { Booking, User } from '../indexedDb/database';

type StoreData = Flight[] | Booking[] | User | unknown;

export function useIndexedDb(storeName: string) {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const initDB = async () => {
      try {
        await flightBookingDB.init();
        setIsReady(true);
      } catch (error) {
        console.error('Failed to initialize IndexedDB:', error);
      }
    };
    initDB();
  }, []);

  const save = useCallback(async (key: string, data: StoreData) => {
    if (!isReady) return;
    try {
      if (storeName === 'searches') {
        await flightBookingDB.saveSearchCache(key, data as Flight[]);
      } else if (storeName === 'flights') {
        await flightBookingDB.saveFlights(data as Flight[]);
      } else if (storeName === 'bookings') {
        await flightBookingDB.saveBooking(data as Booking);
      } else if (storeName === 'users') {
        await flightBookingDB.saveUser(data as User);
      }
    } catch (error) {
      console.error(`Error saving to ${storeName}:`, error);
    }
  }, [isReady, storeName]);

  const load = useCallback(async (key: string) => {
    if (!isReady) return null;
    try {
      if (storeName === 'searches') {
        return await flightBookingDB.getSearchCache(key);
      } else if (storeName === 'flights') {
        return await flightBookingDB.getFlights();
      } else if (storeName === 'bookings') {
        return await flightBookingDB.getBookings();
      } else if (storeName === 'users') {
        return await flightBookingDB.getUser(key);
      }
    } catch (error) {
      console.error(`Error loading from ${storeName}:`, error);
      return null;
    }
  }, [isReady, storeName]);

  const remove = useCallback(async (key: string) => {
    if (!isReady) return;
    try {
      if (storeName === 'searches') {
        await flightBookingDB.clearSearchCache(key);
      }
    } catch (error) {
      console.error(`Error removing from ${storeName}:`, error);
    }
  }, [isReady, storeName]);

  const clear = useCallback(async () => {
    if (!isReady) return;
    try {
      await flightBookingDB.clearAllData();
    } catch (error) {
      console.error(`Error clearing ${storeName}:`, error);
    }
  }, [isReady, storeName]);

  return {
    save,
    load,
    remove,
    clear,
    isReady,
  };
} 