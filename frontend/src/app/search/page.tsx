"use client";
import React, { useState } from "react";
import { FlightSearch, SearchFormData } from "../../components/flights/FlightSearch";
import { BookingModal } from "../../components/bookings/BookingModal";
import { useFlights } from "../../hooks/useFlights";
import { useBookings, Passenger } from "../../hooks/useBookings";
import { useAuth } from "../AuthProvider";
import ProtectedRoute from "../../components/auth/ProtectedRoute";
import { Flight, FlightSearchParams } from "../../types/flight";
import { FaPlaneDeparture } from "react-icons/fa";
import FlightList from "@/components/flights/FlightList";

export default function SearchPage() {
  const auth = useAuth();
  const user = auth?.user;
  const { flights, loading, error, searchFlights } = useFlights();
  const { createBooking } = useBookings();

  const [searchParams, setSearchParams] = useState<SearchFormData | null>(null);
  const [bookingFlight, setBookingFlight] = useState<Flight | null>(null);
  const [bookingError, setBookingError] = useState<string>("");
  const [bookingSuccess, setBookingSuccess] = useState<string>("");

  // Handle search form submit
  const handleSearch = async (params: SearchFormData) => {
    console.log(params, "params");
    setSearchParams(params);
    setBookingSuccess("");
    setBookingError("");
    
    // Convert SearchFormData to FlightSearchParams format
    const searchParams: FlightSearchParams = {
      origin: params.origin || '',
      destination: params.destination || '',
      departure_date: params.departureDate,
      return_date: params.returnDate || '',
      trip_type: params.tripType,
      adults: params.adults,
      children: params.children,
      infants: params.infants,
      cabin_class: params.cabinClass || ''
    };
    
    // Call the search function
    await searchFlights(searchParams);
  };

  // Handle booking
  const handleBook = (flight: Flight) => {
    if (!user) {
      setBookingError("You must be signed in to book a flight.");
      return;
    }
    setBookingFlight(flight);
    setBookingError("");
    setBookingSuccess("");
  };

  const handleBookingConfirm = async (passengers: Passenger[]) => {
    if (!user || !bookingFlight) {
      setBookingError("You must be signed in to book a flight.");
      throw new Error("You must be signed in to book a flight.");
    }

    try {
      const bookingData = {
        flight_id: bookingFlight.id,
        passenger_info: passengers,
        passenger_count: passengers.length,
        total_price: (bookingFlight.price || 0) * passengers.length,
        trip_type: searchParams?.tripType || 'one-way'
      };

      const result = await createBooking(bookingData);

      if (result.success) {
        // Close modal immediately on successful booking
        setBookingFlight(null);
        setBookingError(""); // Clear any previous errors
        // Show success message outside the modal
        setBookingSuccess("Booking confirmed! E-ticket generated.");
        window.location.reload();
      } else {
        setBookingError(result.error || "Failed to create booking. Please try again.");
        throw new Error(result.error || "Failed to create booking");
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An error occurred while creating the booking.";
      setBookingError(errorMessage);
      throw error; // Re-throw to prevent modal from closing
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-blue-400 via-indigo-200 to-purple-200 pb-10 relative overflow-x-hidden w-full">
        {/* Hero Section with background image and glassmorphism */}
        <div className="relative z-10 flex flex-col items-center justify-center h-96">
          <div className="backdrop-blur-md bg-white/30 rounded-3xl shadow-2xl px-8 py-10 flex flex-col items-center gap-4 border border-white/40 animate-fade-in">
            <FaPlaneDeparture className="text-5xl text-blue-700 drop-shadow-lg animate-bounce" />
            <h1 className="text-4xl md:text-5xl font-extrabold text-blue-900 mb-2 drop-shadow-lg tracking-tight">Find Your Next Flight</h1>
            <p className="text-lg md:text-xl font-medium text-blue-800 opacity-90">Book one-way or round-trip flights with ease and style.</p>
          </div>
        </div>

        {/* Search Card with glass effect */}
        <div className="max-w-2xl mx-auto -mt-20 mb-10 relative z-20">
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-blue-100 animate-fade-in-up">
            <FlightSearch onSearch={handleSearch} loading={loading} />
          </div>
        </div>

        {/* Error/Success Feedback */}
        <div className="max-w-6xl mx-auto px-4">
          {error && <div className="mb-4 p-3 rounded bg-red-100 text-red-700 border border-red-200 shadow animate-fade-in">{error}</div>}
          {bookingSuccess && <div className="mb-4 p-3 rounded bg-green-100 text-green-700 border border-green-200 shadow animate-fade-in">{bookingSuccess}</div>}
          {bookingError && <div className="mb-4 p-3 rounded bg-red-100 text-red-700 border border-red-200 shadow animate-fade-in">{bookingError}</div>}
        </div>

        {/* Flight Results */}
        <div className="max-w-6xl mx-auto px-4">
          <FlightList
            flights={flights}
            loading={loading}
            error={error}
            onFlightSelect={handleBook}
          />
        </div>

        {/* Booking Modal */}
        <BookingModal
          open={!!bookingFlight}
          onClose={() => setBookingFlight(null)}
          onConfirm={handleBookingConfirm}
          totalPassengers={(searchParams?.adults || 0) + (searchParams?.children || 0) + (searchParams?.infants || 0) || 1}
          passengerTypes={[
            ...Array(searchParams?.adults || 1).fill("Adult"),
            ...Array(searchParams?.children || 0).fill("Child"),
            ...Array(searchParams?.infants || 0).fill("Infant"),
          ]}
          error={bookingError}
        />
      </div>
    </ProtectedRoute>
  );
} 