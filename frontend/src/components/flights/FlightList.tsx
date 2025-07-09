"use client";
import React, { useState, } from "react";
import { FaPlane, FaClock, FaMapMarkerAlt, FaUsers } from "react-icons/fa";
import { Flight } from "../../types/flight";
import { BookingModal } from "../bookings/BookingModal";

interface FlightListProps {
  flights: Flight[];
  loading: boolean;
  error: string | null;
  onFlightSelect?: (flight: Flight) => void;
}

export default function FlightList({ flights, loading, error, onFlightSelect }: FlightListProps) {
  const [selectedFlight, setSelectedFlight] = useState<Flight | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [sortBy, setSortBy] = useState<'price' | 'departure_time' | 'airline'>('departure_time');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const handleFlightClick = (flight: Flight) => {
    setSelectedFlight(flight);
    setShowBookingModal(true);
    if (onFlightSelect) {
      onFlightSelect(flight);
    }
  };

  const handleSort = (field: 'price' | 'departure_time' | 'airline') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const sortedFlights = [...flights].sort((a, b) => {
    let aValue: string | number;
    let bValue: string | number;

    switch (sortBy) {
      case 'price':
        aValue = a.price;
        bValue = b.price;
        break;
      case 'departure_time':
        aValue = new Date(a.departure_time).getTime();
        bValue = new Date(b.departure_time).getTime();
        break;
      case 'airline':
        aValue = a.airline.toLowerCase();
        bValue = b.airline.toLowerCase();
        break;
      default:
        return 0;
    }

    if (sortOrder === 'asc') {
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    } else {
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
    }
  });

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  const getDuration = (departure: string, arrival: string) => {
    const dep = new Date(departure);
    const arr = new Date(arrival);
    const diffMs = arr.getTime() - dep.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${diffHours}h ${diffMinutes}m`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 text-lg font-semibold mb-2">Error Loading Flights</div>
        <div className="text-gray-600">{error}</div>
      </div>
    );
  }

  if (flights.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-600 text-lg mb-2">No flights found</div>
        <div className="text-gray-500">Try adjusting your search criteria</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Sort Controls */}
      <div className="flex flex-wrap gap-2 mb-4">
        <button
          onClick={() => handleSort('departure_time')}
          className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
            sortBy === 'departure_time'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Time {sortBy === 'departure_time' && (sortOrder === 'asc' ? '↑' : '↓')}
        </button>
        <button
          onClick={() => handleSort('price')}
          className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
            sortBy === 'price'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Price {sortBy === 'price' && (sortOrder === 'asc' ? '↑' : '↓')}
        </button>
        <button
          onClick={() => handleSort('airline')}
          className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
            sortBy === 'airline'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Airline {sortBy === 'airline' && (sortOrder === 'asc' ? '↑' : '↓')}
        </button>
      </div>

      {/* Flight Cards */}
      <div className="grid gap-4">
        {sortedFlights.map((flight) => (
          <div
            key={flight.id}
            onClick={() => handleFlightClick(flight)}
            className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-100 overflow-hidden"
          >
            <div className="p-6">
              {/* Header */}
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <FaPlane className="text-blue-600 text-xl" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{flight.flight_number}</h3>
                    <p className="text-gray-600">{flight.airline}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-blue-600">${flight.price}</div>
                  <div className="text-sm text-gray-500">per person</div>
                </div>
              </div>

              {/* Route and Time */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <FaMapMarkerAlt className="text-green-600" />
                  <div>
                    <div className="font-semibold text-gray-900">{flight.origin}</div>
                    <div className="text-sm text-gray-600">{formatTime(flight.departure_time)}</div>
                  </div>
                </div>

                <div className="flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-sm text-gray-500 mb-1">
                      {getDuration(flight.departure_time, flight.arrival_time)}
                    </div>
                    <div className="w-16 h-px bg-gray-300 relative">
                      <div className="absolute -top-1 left-1/2 transform -translate-x-1/2">
                        <FaPlane className="text-blue-600 text-xs" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 justify-end">
                  <div className="text-right">
                    <div className="font-semibold text-gray-900">{flight.destination}</div>
                    <div className="text-sm text-gray-600">{formatTime(flight.arrival_time)}</div>
                  </div>
                  <FaMapMarkerAlt className="text-red-600" />
                </div>
              </div>

              {/* Flight Details */}
              <div className="flex flex-wrap justify-between items-center gap-4 pt-4 border-t border-gray-100">
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <FaClock className="text-gray-400" />
                    <span>{formatDate(flight.departure_time)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <FaUsers className="text-gray-400" />
                    <span>{flight.available_seats} seats left</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                    {flight.cabin_class}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    flight.status === 'scheduled' ? 'bg-green-100 text-green-800' :
                    flight.status === 'delayed' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {flight.status}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Booking Modal */}
      {showBookingModal && selectedFlight && (
        <BookingModal
          open={showBookingModal}
          onClose={() => {
            setShowBookingModal(false);
            setSelectedFlight(null);
          }}
          onConfirm={(passengers) => {
            // Handle booking confirmation
            console.log('Booking confirmed:', passengers);
            setShowBookingModal(false);
            setSelectedFlight(null);
          }}
          totalPassengers={1}
          passengerTypes={['Adult']}
        />
      )}
    </div>
  );
} 