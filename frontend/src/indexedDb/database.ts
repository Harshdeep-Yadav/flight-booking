export interface Flight {
  id: string;
  flight_number: string;
  airline: string;
  origin: string;
  destination: string;
  departure_time: string;
  arrival_time: string;
  price: number;
  available_seats: number;
  cabin_class: string;
}

export interface Passenger {
  first_name: string;
  last_name: string;
  date_of_birth: string;
  passport_number?: string;
  type: 'adult' | 'child' | 'infant';
}

export interface Booking {
  id: string;
  user_id: string;
  flight_id: string;
  passenger_count: number;
  total_price: number;
  status: string;
  passenger_info: Passenger[];
  created_at: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
}

class FlightBookingDB {
  private db: IDBDatabase | null = null;
  private readonly dbName = 'FlightBookingDB';
  private readonly version = 1;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create flights store
        if (!db.objectStoreNames.contains('flights')) {
          const flightStore = db.createObjectStore('flights', { keyPath: 'id' });
          flightStore.createIndex('origin', 'origin', { unique: false });
          flightStore.createIndex('destination', 'destination', { unique: false });
          flightStore.createIndex('departure_time', 'departure_time', { unique: false });
          flightStore.createIndex('search_cache', 'search_cache', { unique: false });
        }

        // Create bookings store
        if (!db.objectStoreNames.contains('bookings')) {
          const bookingStore = db.createObjectStore('bookings', { keyPath: 'id' });
          bookingStore.createIndex('user_id', 'user_id', { unique: false });
          bookingStore.createIndex('status', 'status', { unique: false });
          bookingStore.createIndex('created_at', 'created_at', { unique: false });
        }

        // Create users store
        if (!db.objectStoreNames.contains('users')) {
          const userStore = db.createObjectStore('users', { keyPath: 'id' });
          userStore.createIndex('email', 'email', { unique: true });
        }

        // Create search cache store
        if (!db.objectStoreNames.contains('searchCache')) {
          const cacheStore = db.createObjectStore('searchCache', { keyPath: 'id' });
          cacheStore.createIndex('query', 'query', { unique: true });
          cacheStore.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };
    });
  }

  // Flight operations
  async saveFlights(flights: Flight[]): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    
    const transaction = this.db.transaction(['flights'], 'readwrite');
    const store = transaction.objectStore('flights');

    for (const flight of flights) {
      await new Promise((resolve, reject) => {
        const request = store.put(flight);
        request.onsuccess = () => resolve(undefined);
        request.onerror = () => reject(request.error);
      });
    }
  }

  async getFlights(): Promise<Flight[]> {
    if (!this.db) throw new Error('Database not initialized');
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['flights'], 'readonly');
      const store = transaction.objectStore('flights');
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async searchFlights(query: {
    origin?: string;
    destination?: string;
    departure_date?: string;
    cabin_class?: string;
  }): Promise<Flight[]> {
    if (!this.db) throw new Error('Database not initialized');
    
    const allFlights = await this.getFlights();
    
    return allFlights.filter(flight => {
      if (query.origin && flight.origin.toLowerCase() !== query.origin.toLowerCase()) {
        return false;
      }
      if (query.destination && flight.destination.toLowerCase() !== query.destination.toLowerCase()) {
        return false;
      }
      if (query.departure_date) {
        const flightDate = new Date(flight.departure_time).toISOString().split('T')[0];
        if (flightDate !== query.departure_date) {
          return false;
        }
      }
      if (query.cabin_class && flight.cabin_class !== query.cabin_class) {
        return false;
      }
      return true;
    });
  }

  // Booking operations
  async saveBooking(booking: Booking): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['bookings'], 'readwrite');
      const store = transaction.objectStore('bookings');
      const request = store.put(booking);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getBookings(userId?: string): Promise<Booking[]> {
    if (!this.db) throw new Error('Database not initialized');
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['bookings'], 'readonly');
      const store = transaction.objectStore('bookings');
      const request = userId 
        ? store.index('user_id').getAll(userId)
        : store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async updateBooking(bookingId: string, updates: Partial<Booking>): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    
    const booking = await this.getBooking(bookingId);
    if (!booking) throw new Error('Booking not found');
    
    const updatedBooking = { ...booking, ...updates };
    await this.saveBooking(updatedBooking);
  }

  async getBooking(bookingId: string): Promise<Booking | null> {
    if (!this.db) throw new Error('Database not initialized');
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['bookings'], 'readonly');
      const store = transaction.objectStore('bookings');
      const request = store.get(bookingId);

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  // User operations
  async saveUser(user: User): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['users'], 'readwrite');
      const store = transaction.objectStore('users');
      const request = store.put(user);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getUser(userId: string): Promise<User | null> {
    if (!this.db) throw new Error('Database not initialized');
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['users'], 'readonly');
      const store = transaction.objectStore('users');
      const request = store.get(userId);

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  // Search cache operations
  async saveSearchCache(query: string, results: Flight[]): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    
    const cacheEntry = {
      id: query,
      query,
      results,
      timestamp: new Date().toISOString()
    };
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['searchCache'], 'readwrite');
      const store = transaction.objectStore('searchCache');
      const request = store.put(cacheEntry);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getSearchCache(query: string): Promise<Flight[] | null> {
    if (!this.db) throw new Error('Database not initialized');
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['searchCache'], 'readonly');
      const store = transaction.objectStore('searchCache');
      const request = store.get(query);

      request.onsuccess = () => {
        const cacheEntry = request.result;
        if (cacheEntry) {
          // Check if cache is still valid (24 hours)
          const cacheAge = Date.now() - new Date(cacheEntry.timestamp).getTime();
          const maxAge = 24 * 60 * 60 * 1000; // 24 hours
          
          if (cacheAge < maxAge) {
            resolve(cacheEntry.results);
          } else {
            // Cache expired, remove it
            this.clearSearchCache(query);
            resolve(null);
          }
        } else {
          resolve(null);
        }
      };
      request.onerror = () => reject(request.error);
    });
  }

  async clearSearchCache(query?: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['searchCache'], 'readwrite');
      const store = transaction.objectStore('searchCache');
      
      if (query) {
        const request = store.delete(query);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      } else {
        const request = store.clear();
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      }
    });
  }

  // Utility operations
  async clearAllData(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    
    const stores = ['flights', 'bookings', 'users', 'searchCache'];
    
    for (const storeName of stores) {
      await new Promise((resolve, reject) => {
        const transaction = this.db!.transaction([storeName], 'readwrite');
        const store = transaction.objectStore(storeName);
        const request = store.clear();
        
        request.onsuccess = () => resolve(undefined);
        request.onerror = () => reject(request.error);
      });
    }
  }

  async getDatabaseSize(): Promise<number> {
    if (!this.db) throw new Error('Database not initialized');
    
    let totalSize = 0;
    const stores = ['flights', 'bookings', 'users', 'searchCache'];
    
    for (const storeName of stores) {
      const size = await new Promise<number>((resolve, reject) => {
        const transaction = this.db!.transaction([storeName], 'readonly');
        const store = transaction.objectStore(storeName);
        const request = store.count();
        
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
      
      totalSize += size;
    }
    
    return totalSize;
  }
}

export const flightBookingDB = new FlightBookingDB(); 