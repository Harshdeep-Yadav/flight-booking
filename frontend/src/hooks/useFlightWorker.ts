import { useCallback, useEffect, useRef, useState } from 'react';
import type { Flight, SearchQuery, SortOptions, FilterOptions } from '../workers/flightWorker';

interface WorkerResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

interface FlightAnalysis {
  totalFlights: number;
  averagePrice: number;
  priceRange: { min: number; max: number };
  popularAirlines: Array<{ airline: string; count: number }>;
  popularRoutes: Array<{ route: string; count: number }>;
}

export function useFlightWorker() {
  const workerRef = useRef<Worker | null>(null);
  const [searchResult, setSearchResult] = useState<WorkerResult<Flight[]>>({
    data: null,
    loading: false,
    error: null
  });
  const [sortResult, setSortResult] = useState<WorkerResult<Flight[]>>({
    data: null,
    loading: false,
    error: null
  });
  const [filterResult, setFilterResult] = useState<WorkerResult<Flight[]>>({
    data: null,
    loading: false,
    error: null
  });
  const [analysisResult, setAnalysisResult] = useState<WorkerResult<FlightAnalysis>>({
    data: null,
    loading: false,
    error: null
  });

  // Initialize worker
  useEffect(() => {
    if (typeof window !== 'undefined' && !workerRef.current) {
      workerRef.current = new Worker(new URL('../workers/flightWorker.ts', import.meta.url), {
        type: 'module'
      });

      // Set up message handlers
      workerRef.current.onmessage = (event) => {
        const { type, payload } = event.data;

        switch (type) {
          case 'SEARCH_RESULT':
            setSearchResult({
              data: payload.results,
              loading: false,
              error: null
            });
            break;
          case 'SORT_RESULT':
            setSortResult({
              data: payload.results,
              loading: false,
              error: null
            });
            break;
          case 'FILTER_RESULT':
            setFilterResult({
              data: payload.results,
              loading: false,
              error: null
            });
            break;
          case 'ANALYZE_RESULT':
            setAnalysisResult({
              data: payload,
              loading: false,
              error: null
            });
            break;
          case 'ERROR':
            setSearchResult(prev => ({ ...prev, loading: false, error: payload.message }));
            setSortResult(prev => ({ ...prev, loading: false, error: payload.message }));
            setFilterResult(prev => ({ ...prev, loading: false, error: payload.message }));
            setAnalysisResult(prev => ({ ...prev, loading: false, error: payload.message }));
            break;
        }
      };

      workerRef.current.onerror = (error) => {
        console.error('Worker error:', error);
        setSearchResult(prev => ({ ...prev, loading: false, error: 'Worker error occurred' }));
        setSortResult(prev => ({ ...prev, loading: false, error: 'Worker error occurred' }));
        setFilterResult(prev => ({ ...prev, loading: false, error: 'Worker error occurred' }));
        setAnalysisResult(prev => ({ ...prev, loading: false, error: 'Worker error occurred' }));
      };
    }

    // Cleanup
    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
        workerRef.current = null;
      }
    };
  }, []);

  // Search flights
  const searchFlights = useCallback((flights: Flight[], query: SearchQuery) => {
    if (!workerRef.current) {
      setSearchResult(prev => ({ ...prev, error: 'Worker not initialized' }));
      return;
    }

    setSearchResult(prev => ({ ...prev, loading: true, error: null }));
    workerRef.current.postMessage({
      type: 'SEARCH',
      payload: { flights, query }
    });
  }, []);

  // Sort flights
  const sortFlights = useCallback((flights: Flight[], sortOptions: SortOptions) => {
    if (!workerRef.current) {
      setSortResult(prev => ({ ...prev, error: 'Worker not initialized' }));
      return;
    }

    setSortResult(prev => ({ ...prev, loading: true, error: null }));
    workerRef.current.postMessage({
      type: 'SORT',
      payload: { flights, sortOptions }
    });
  }, []);

  // Filter flights
  const filterFlights = useCallback((flights: Flight[], filterOptions: FilterOptions) => {
    if (!workerRef.current) {
      setFilterResult(prev => ({ ...prev, error: 'Worker not initialized' }));
      return;
    }

    setFilterResult(prev => ({ ...prev, loading: true, error: null }));
    workerRef.current.postMessage({
      type: 'FILTER',
      payload: { flights, filterOptions }
    });
  }, []);

  // Analyze flights
  const analyzeFlights = useCallback((flights: Flight[]) => {
    if (!workerRef.current) {
      setAnalysisResult(prev => ({ ...prev, error: 'Worker not initialized' }));
      return;
    }

    setAnalysisResult(prev => ({ ...prev, loading: true, error: null }));
    workerRef.current.postMessage({
      type: 'ANALYZE',
      payload: { flights }
    });
  }, []);

  // Clear results
  const clearResults = useCallback(() => {
    setSearchResult({ data: null, loading: false, error: null });
    setSortResult({ data: null, loading: false, error: null });
    setFilterResult({ data: null, loading: false, error: null });
    setAnalysisResult({ data: null, loading: false, error: null });
  }, []);

  return {
    // Search operations
    searchFlights,
    searchResult,
    
    // Sort operations
    sortFlights,
    sortResult,
    
    // Filter operations
    filterFlights,
    filterResult,
    
    // Analysis operations
    analyzeFlights,
    analysisResult,
    
    // Utility
    clearResults,
    
    // Worker status
    isWorkerReady: !!workerRef.current
  };
} 