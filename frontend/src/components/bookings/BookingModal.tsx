"use client";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { FaTimes, FaUser, FaCalendar, FaPassport } from "react-icons/fa";
import { Passenger } from "../../hooks/useBookings";

interface BookingModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (passengers: Passenger[]) => Promise<void>;
  totalPassengers: number;
  passengerTypes: string[];
  error?: string;
}

interface PassengerFormData {
  first_name: string;
  last_name: string;
  date_of_birth: string;
  passport_number?: string;
  seat_preference?: string;
}

export function BookingModal({
  open,
  onClose,
  onConfirm,
  totalPassengers,
  passengerTypes,
  error
}: BookingModalProps) {
  const [currentPassengerIndex, setCurrentPassengerIndex] = useState(0);
  const [passengers, setPassengers] = useState<Passenger[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<PassengerFormData>();

  if (!open) return null;

  const onSubmit = async (data: PassengerFormData) => {
    const passenger: Passenger = {
      type: passengerTypes[currentPassengerIndex].toLowerCase() as "adult" | "child" | "infant",
      first_name: data.first_name,
      last_name: data.last_name,
      date_of_birth: data.date_of_birth,
      passport_number: data.passport_number
    };

    const newPassengers = [...passengers, passenger];
    setPassengers(newPassengers);

    if (currentPassengerIndex < totalPassengers - 1) {
      setCurrentPassengerIndex(currentPassengerIndex + 1);
      reset();
    } else {
      setIsSubmitting(true);
      try {
        await onConfirm(newPassengers);
        onClose();
        // Only reset if the booking was successful
        setPassengers([]);
        setCurrentPassengerIndex(0);
        reset();
      } catch (error) {
        console.error('Booking failed:', error);
        // Don't reset the form if booking failed
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleClose = () => {
    setPassengers([]);
    setCurrentPassengerIndex(0);
    reset();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Passenger {currentPassengerIndex + 1} of {totalPassengers}
            </h2>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <FaTimes className="text-xl" />
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg border border-red-200">
              {error}
            </div>
          )}

          <div className="mb-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Type:</strong> {passengerTypes[currentPassengerIndex]}
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FaUser className="inline mr-2" />
                  First Name
                </label>
                <input
                  type="text"
                  {...register("first_name", { 
                    required: "First name is required",
                    minLength: { value: 2, message: "First name must be at least 2 characters" }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="First name"
                />
                {errors.first_name && (
                  <p className="mt-1 text-xs text-red-600">{errors.first_name.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FaUser className="inline mr-2" />
                  Last Name
                </label>
                <input
                  type="text"
                  {...register("last_name", { 
                    required: "Last name is required",
                    minLength: { value: 2, message: "Last name must be at least 2 characters" }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Last name"
                />
                {errors.last_name && (
                  <p className="mt-1 text-xs text-red-600">{errors.last_name.message}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FaCalendar className="inline mr-2" />
                Date of Birth
              </label>
              <input
                type="date"
                {...register("date_of_birth", { 
                  required: "Date of birth is required",
                  validate: (value) => {
                    const today = new Date();
                    const birthDate = new Date(value);
                    const age = today.getFullYear() - birthDate.getFullYear();
                    return age >= 0 || "Invalid date of birth";
                  }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {errors.date_of_birth && (
                <p className="mt-1 text-xs text-red-600">{errors.date_of_birth.message}</p>
              )}
            </div>

            {passengerTypes[currentPassengerIndex] === "Adult" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FaPassport className="inline mr-2" />
                  Passport Number
                </label>
                <input
                  type="text"
                  {...register("passport_number", { 
                    required: "Passport number is required for adults",
                    minLength: { value: 6, message: "Passport number must be at least 6 characters" }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Passport number"
                />
                {errors.passport_number && (
                  <p className="mt-1 text-xs text-red-600">{errors.passport_number.message}</p>
                )}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Seat Preference
              </label>
              <select
                {...register("seat_preference")}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">No preference</option>
                <option value="window">Window</option>
                <option value="aisle">Aisle</option>
                <option value="front">Front</option>
                <option value="back">Back</option>
              </select>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={handleClose}
                disabled={isSubmitting}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSubmitting && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                )}
                {currentPassengerIndex < totalPassengers - 1 ? "Next" : (isSubmitting ? "Processing..." : "Confirm Booking")}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 