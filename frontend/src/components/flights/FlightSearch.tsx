"use client";
import React from "react";
import { useForm } from "react-hook-form";
import { FaPlane, FaCalendar, FaUsers, FaSearch } from "react-icons/fa";

export interface SearchFormData {
  origin?: string;
  destination?: string;
  departureDate: string;
  returnDate?: string;
  tripType: "one-way" | "round-trip";
  adults: number;
  children: number;
  infants: number;
  cabinClass: string;
}

interface FlightSearchProps {
  onSearch: (data: SearchFormData) => void;
  loading?: boolean;
}

export function FlightSearch({ onSearch, loading }: FlightSearchProps) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm<SearchFormData>({
    defaultValues: {
      tripType: "one-way",
      adults: 1,
      children: 0,
      infants: 0,
      cabinClass: "Economy"
    }
  });

  const tripType = watch("tripType");

  const onSubmit = (data: SearchFormData) => {
    onSearch(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Search Flights
        </h1>
        <p className="text-gray-600">
          Enter departure date to see all flights, or add origin/destination for specific routes
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Origin */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <FaPlane className="inline mr-2" />
            Origin (Optional)
          </label>
          <input
            type="text"
            {...register("origin", { 
              minLength: { value: 3, message: "Origin must be at least 3 characters" }
            })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="e.g., JFK, LAX (leave empty for all flights)"
          />
          {errors.origin && (
            <p className="mt-1 text-sm text-red-600">{errors.origin.message}</p>
          )}
        </div>

        {/* Destination */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <FaPlane className="inline mr-2" />
            Destination (Optional)
          </label>
          <input
            type="text"
            {...register("destination", { 
              minLength: { value: 3, message: "Destination must be at least 3 characters" }
            })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="e.g., LAX, JFK (leave empty for all flights)"
          />
          {errors.destination && (
            <p className="mt-1 text-sm text-red-600">{errors.destination.message}</p>
          )}
        </div>
      </div>

      {/* Trip Type */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Trip Type</label>
        <div className="flex space-x-4">
          <label className="flex items-center">
            <input
              type="radio"
              value="one-way"
              {...register("tripType")}
              className="mr-2"
            />
            One Way
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              value="round-trip"
              {...register("tripType")}
              className="mr-2"
            />
            Round Trip
          </label>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Departure Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <FaCalendar className="inline mr-2" />
            Departure Date
          </label>
          <input
            type="date"
            {...register("departureDate", { 
              required: "Departure date is required",
              validate: (value) => {
                const today = new Date();
                const selectedDate = new Date(value);
                return selectedDate >= today || "Departure date must be in the future";
              }
            })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {errors.departureDate && (
            <p className="mt-1 text-sm text-red-600">{errors.departureDate.message}</p>
          )}
        </div>

        {/* Return Date */}
        {tripType === "round-trip" && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FaCalendar className="inline mr-2" />
              Return Date
            </label>
            <input
              type="date"
              {...register("returnDate", {
                validate: (value) => {
                  if (tripType === "round-trip") {
                    if (!value) return "Return date is required for round-trip";
                    const departureDate = watch("departureDate");
                    if (departureDate && value <= departureDate) {
                      return "Return date must be after departure date";
                    }
                  }
                  return true;
                }
              })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {errors.returnDate && (
              <p className="mt-1 text-sm text-red-600">{errors.returnDate.message}</p>
            )}
          </div>
        )}
      </div>

      {/* Passengers */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <FaUsers className="inline mr-2" />
          Passengers
        </label>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-xs text-gray-600 mb-1">Adults (12+)</label>
            <input
              type="number"
              min="1"
              max="9"
              {...register("adults", { 
                required: "Number of adults is required",
                min: { value: 1, message: "At least 1 adult required" },
                max: { value: 9, message: "Maximum 9 adults" }
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {errors.adults && (
              <p className="mt-1 text-xs text-red-600">{errors.adults.message}</p>
            )}
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Children (2-11)</label>
            <input
              type="number"
              min="0"
              max="9"
              {...register("children", { 
                required: "Number of children is required",
                min: { value: 0, message: "Children cannot be negative" },
                max: { value: 9, message: "Maximum 9 children" }
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {errors.children && (
              <p className="mt-1 text-xs text-red-600">{errors.children.message}</p>
            )}
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Infants (0-1)</label>
            <input
              type="number"
              min="0"
              max="4"
              {...register("infants", { 
                required: "Number of infants is required",
                min: { value: 0, message: "Infants cannot be negative" },
                max: { value: 4, message: "Maximum 4 infants" }
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {errors.infants && (
              <p className="mt-1 text-xs text-red-600">{errors.infants.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* Cabin Class */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Cabin Class</label>
        <select
          {...register("cabinClass", { required: "Cabin class is required" })}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="Economy">Economy</option>
          <option value="Premium Economy">Premium Economy</option>
          <option value="Business">Business</option>
          <option value="First">First</option>
        </select>
        {errors.cabinClass && (
          <p className="mt-1 text-sm text-red-600">{errors.cabinClass.message}</p>
        )}
      </div>

      {/* Search Button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        <FaSearch />
        {loading ? "Searching..." : "Search Flights"}
      </button>
    </form>
  );
} 