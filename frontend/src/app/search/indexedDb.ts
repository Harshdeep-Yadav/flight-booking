import { Flight } from '../../types/flight';

// Simple IndexedDB utility for flight search caching
export async function saveSearchResults(key: string, results: Flight[]) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('FlightDB', 1);
    request.onupgradeneeded = () => {
      request.result.createObjectStore('searches');
    };
    request.onsuccess = () => {
      const db = request.result;
      const tx = db.transaction('searches', 'readwrite');
      tx.objectStore('searches').put(results, key);
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => reject(tx.error);
    };
    request.onerror = () => reject(request.error);
  });
}

export async function loadSearchResults(key: string): Promise<Flight[] | null> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('FlightDB', 1);
    request.onupgradeneeded = () => {
      request.result.createObjectStore('searches');
    };
    request.onsuccess = () => {
      const db = request.result;
      const tx = db.transaction('searches', 'readonly');
      const getReq = tx.objectStore('searches').get(key);
      getReq.onsuccess = () => resolve(getReq.result || null);
      getReq.onerror = () => reject(getReq.error);
    };
    request.onerror = () => reject(request.error);
  });
} 