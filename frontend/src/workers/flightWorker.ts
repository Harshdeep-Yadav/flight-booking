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

export interface SearchQuery {
  origin?: string;
  destination?: string;
  departure_date?: string;
  return_date?: string;
  passengers?: number;
  cabin_class?: string;
  max_price?: number;
  airlines?: string[];
}

export interface SortOptions {
  field: 'price' | 'departure_time' | 'duration' | 'airline';
  direction: 'asc' | 'desc';
}

export interface FilterOptions {
  price_range?: { min: number; max: number };
  departure_time_range?: { start: string; end: string };
  airlines?: string[];
  cabin_classes?: string[];
  available_seats?: number;
}

// Worker message types
export interface WorkerMessage {
  type: 'SEARCH' | 'SORT' | 'FILTER' | 'ANALYZE';
  payload: SearchPayload | SortPayload | FilterPayload | AnalyzePayload;
}

export interface SearchPayload {
  flights: Flight[];
  query: SearchQuery;
}

export interface SortPayload {
  flights: Flight[];
  sortOptions: SortOptions;
}

export interface FilterPayload {
  flights: Flight[];
  filterOptions: FilterOptions;
}

export interface AnalyzePayload {
  flights: Flight[];
}

export interface SearchMessage extends WorkerMessage {
  type: 'SEARCH';
  payload: SearchPayload;
}

export interface SortMessage extends WorkerMessage {
  type: 'SORT';
  payload: SortPayload;
}

export interface FilterMessage extends WorkerMessage {
  type: 'FILTER';
  payload: FilterPayload;
}

export interface AnalyzeMessage extends WorkerMessage {
  type: 'ANALYZE';
  payload: AnalyzePayload;
}

// Utility functions
function calculateDuration(departure: string, arrival: string): number {
  const dep = new Date(departure);
  const arr = new Date(arrival);
  return arr.getTime() - dep.getTime();
}

function matchesSearchQuery(flight: Flight, query: SearchQuery): boolean {
  // Origin and destination matching
  if (query.origin && flight.origin.toLowerCase() !== query.origin.toLowerCase()) {
    return false;
  }
  if (query.destination && flight.destination.toLowerCase() !== query.destination.toLowerCase()) {
    return false;
  }

  // Date matching
  if (query.departure_date) {
    const flightDate = new Date(flight.departure_time).toISOString().split('T')[0];
    if (flightDate !== query.departure_date) {
      return false;
    }
  }

  // Cabin class matching
  if (query.cabin_class && flight.cabin_class !== query.cabin_class) {
    return false;
  }

  // Price matching
  if (query.max_price && flight.price > query.max_price) {
    return false;
  }

  // Airline matching
  if (query.airlines && query.airlines.length > 0) {
    if (!query.airlines.includes(flight.airline)) {
      return false;
    }
  }

  // Available seats matching
  if (query.passengers && flight.available_seats < query.passengers) {
    return false;
  }

  return true;
}

function applyFilters(flights: Flight[], filterOptions: FilterOptions): Flight[] {
  return flights.filter(flight => {
    // Price range filter
    if (filterOptions.price_range) {
      const { min, max } = filterOptions.price_range;
      if (flight.price < min || flight.price > max) {
        return false;
      }
    }

    // Departure time range filter
    if (filterOptions.departure_time_range) {
      const flightTime = new Date(flight.departure_time);
      const startTime = new Date(filterOptions.departure_time_range.start);
      const endTime = new Date(filterOptions.departure_time_range.end);
      
      if (flightTime < startTime || flightTime > endTime) {
        return false;
      }
    }

    // Airlines filter
    if (filterOptions.airlines && filterOptions.airlines.length > 0) {
      if (!filterOptions.airlines.includes(flight.airline)) {
        return false;
      }
    }

    // Cabin classes filter
    if (filterOptions.cabin_classes && filterOptions.cabin_classes.length > 0) {
      if (!filterOptions.cabin_classes.includes(flight.cabin_class)) {
        return false;
      }
    }

    // Available seats filter
    if (filterOptions.available_seats) {
      if (flight.available_seats < filterOptions.available_seats) {
        return false;
      }
    }

    return true;
  });
}

function sortFlights(flights: Flight[], sortOptions: SortOptions): Flight[] {
  const { field, direction } = sortOptions;
  
  return [...flights].sort((a, b) => {
    let aValue: number | string;
    let bValue: number | string;

    switch (field) {
      case 'price':
        aValue = a.price;
        bValue = b.price;
        break;
      case 'departure_time':
        aValue = new Date(a.departure_time).getTime();
        bValue = new Date(b.departure_time).getTime();
        break;
      case 'duration':
        aValue = calculateDuration(a.departure_time, a.arrival_time);
        bValue = calculateDuration(b.departure_time, b.arrival_time);
        break;
      case 'airline':
        aValue = a.airline.toLowerCase();
        bValue = b.airline.toLowerCase();
        break;
      default:
        return 0;
    }

    if (direction === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });
}

function analyzeFlights(flights: Flight[]) {
  const analysis = {
    total_flights: flights.length,
    average_price: 0,
    price_range: { min: 0, max: 0 },
    airlines: {} as Record<string, number>,
    cabin_classes: {} as Record<string, number>,
    popular_routes: {} as Record<string, number>,
    time_distribution: {
      morning: 0, // 6-12
      afternoon: 0, // 12-18
      evening: 0, // 18-24
      night: 0 // 0-6
    }
  };

  if (flights.length === 0) {
    return analysis;
  }

  let totalPrice = 0;
  let minPrice = Infinity;
  let maxPrice = -Infinity;

  flights.forEach(flight => {
    // Price analysis
    totalPrice += flight.price;
    minPrice = Math.min(minPrice, flight.price);
    maxPrice = Math.max(maxPrice, flight.price);

    // Airline analysis
    analysis.airlines[flight.airline] = (analysis.airlines[flight.airline] || 0) + 1;

    // Cabin class analysis
    analysis.cabin_classes[flight.cabin_class] = (analysis.cabin_classes[flight.cabin_class] || 0) + 1;

    // Route analysis
    const route = `${flight.origin}-${flight.destination}`;
    analysis.popular_routes[route] = (analysis.popular_routes[route] || 0) + 1;

    // Time distribution analysis
    const departureHour = new Date(flight.departure_time).getHours();
    if (departureHour >= 6 && departureHour < 12) {
      analysis.time_distribution.morning++;
    } else if (departureHour >= 12 && departureHour < 18) {
      analysis.time_distribution.afternoon++;
    } else if (departureHour >= 18 && departureHour < 24) {
      analysis.time_distribution.evening++;
    } else {
      analysis.time_distribution.night++;
    }
  });

  analysis.average_price = totalPrice / flights.length;
  analysis.price_range = { min: minPrice, max: maxPrice };

  return analysis;
}

// Worker message handler
self.onmessage = function(e: MessageEvent<WorkerMessage>) {
  const { type, payload } = e.data;

  try {
    switch (type) {
      case 'SEARCH':
        const searchPayload = payload as SearchPayload;
        const searchResults = searchPayload.flights.filter(flight => 
          matchesSearchQuery(flight, searchPayload.query)
        );
        self.postMessage({
          type: 'SEARCH_RESULT',
          payload: { results: searchResults }
        });
        break;

      case 'SORT':
        const sortPayload = payload as SortPayload;
        const sortResults = sortFlights(sortPayload.flights, sortPayload.sortOptions);
        self.postMessage({
          type: 'SORT_RESULT',
          payload: { results: sortResults }
        });
        break;

      case 'FILTER':
        const filterPayload = payload as FilterPayload;
        const filterResults = applyFilters(filterPayload.flights, filterPayload.filterOptions);
        self.postMessage({
          type: 'FILTER_RESULT',
          payload: { results: filterResults }
        });
        break;

      case 'ANALYZE':
        const analyzePayload = payload as AnalyzePayload;
        const analysisResults = analyzeFlights(analyzePayload.flights);
        self.postMessage({
          type: 'ANALYZE_RESULT',
          payload: analysisResults
        });
        break;

      default:
        self.postMessage({
          type: 'ERROR',
          payload: { message: 'Unknown message type' }
        });
    }
  } catch (error) {
    self.postMessage({
      type: 'ERROR',
      payload: { message: error instanceof Error ? error.message : 'Unknown error' }
    });
  }
};

// Export for TypeScript compilation
export {}; 