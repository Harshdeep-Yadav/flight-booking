import { Flight } from '../types/flight';

interface FilterOptions {
  origin?: string;
  destination?: string;
  cabinClass?: string;
  departureDate?: string;
}

// Web Worker for filtering and sorting flights
self.onmessage = function (e: MessageEvent<{
  flights: Flight[];
  filters: FilterOptions;
  sortBy: string;
}>) {
  const { flights, filters, sortBy } = e.data;
  let result = flights;
  
  // Filtering
  if (filters.origin) result = result.filter((f: Flight) => f.origin === filters.origin);
  if (filters.destination) result = result.filter((f: Flight) => f.destination === filters.destination);
  if (filters.cabinClass) result = result.filter((f: Flight) => f.cabin_class === filters.cabinClass);
  if (filters.departureDate) result = result.filter((f: Flight) => f.departure_time.startsWith(filters.departureDate!));
  
  // Sorting
  if (sortBy === 'price') result = result.sort((a: Flight, b: Flight) => a.price - b.price);
  if (sortBy === 'duration') {
    result = result.sort((a: Flight, b: Flight) => {
      const durationA = calculateDuration(a.departure_time, a.arrival_time);
      const durationB = calculateDuration(b.departure_time, b.arrival_time);
      return durationA.localeCompare(durationB);
    });
  }
  
  self.postMessage(result);
};

function calculateDuration(departure: string, arrival: string): string {
  const dep = new Date(departure);
  const arr = new Date(arrival);
  const diffMs = arr.getTime() - dep.getTime();
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  return `${hours}h ${minutes}m`;
} 