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
  status?: string;
  duration?: string;
}

export interface FlightSearchParams {
  origin: string;
  destination: string;
  departure_date: string;
  return_date?: string;
  trip_type: "one-way" | "round-trip";
  adults: number;
  children: number;
  infants: number;
  cabin_class: string;
}

export interface FlightFilters {
  origin?: string;
  destination?: string;
  departure_date?: string;
  return_date?: string;
  passengers?: number;
  cabin_class?: string;
  max_price?: number;
  airlines?: string[];
}

export interface FlightSortOptions {
  field: 'price' | 'departure_time' | 'duration' | 'airline';
  direction: 'asc' | 'desc';
} 