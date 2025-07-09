"use client";
import React, { useState, useEffect } from "react";
import { useAuth } from "../AuthProvider";
import { useBookings } from "../../hooks/useBookings";
import ProtectedRoute from "../../components/auth/ProtectedRoute";
import { FaUser, FaEnvelope, FaPhone, FaHistory, FaEdit, FaSave, FaTimes } from "react-icons/fa";

export default function ProfilePage() {
  const { user, updateProfile, signOut } = useAuth();
  const { bookings, loading: bookingsLoading, getUserBookings } = useBookings();
  
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    full_name: user?.full_name || "",
    phone: user?.phone || "",
  });
  const [updateLoading, setUpdateLoading] = useState(false);
  const [updateError, setUpdateError] = useState("");
  const [updateSuccess, setUpdateSuccess] = useState("");

  useEffect(() => {
    if (user) {
      getUserBookings();
    }
  }, [user, getUserBookings]);

  useEffect(() => {
    if (user) {
      setFormData({
        full_name: user.full_name || "",
        phone: user.phone || "",
      });
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    setUpdateLoading(true);
    setUpdateError("");
    setUpdateSuccess("");

    try {
      const result = await updateProfile(formData);
      if (result?.error) {
        setUpdateError(result.error);
      } else {
        setUpdateSuccess("Profile updated successfully!");
        setIsEditing(false);
      }
    } catch {
      setUpdateError("Failed to update profile");
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      full_name: user?.full_name || "",
      phone: user?.phone || "",
    });
    setIsEditing(false);
    setUpdateError("");
    setUpdateSuccess("");
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-18">
        <div className="max-w-4xl mx-auto px-4">
          {/* Profile Header */}
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
              <button
                onClick={signOut}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Sign Out
              </button>
            </div>

            {/* Profile Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <FaUser className="text-blue-600 text-xl" />
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Full Name</label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="full_name"
                        value={formData.full_name}
                        onChange={handleInputChange}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    ) : (
                      <p className="text-lg font-medium text-gray-900">{user?.full_name || "Not set"}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <FaEnvelope className="text-blue-600 text-xl" />
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <p className="text-lg font-medium text-gray-900">{user?.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <FaPhone className="text-blue-600 text-xl" />
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Phone</label>
                    {isEditing ? (
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    ) : (
                      <p className="text-lg font-medium text-gray-900">{user?.phone || "Not set"}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">{user?.role?.charAt(0).toUpperCase()}</span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Role</label>
                    <p className="text-lg font-medium text-gray-900 capitalize">{user?.role}</p>
                  </div>
                </div>
              </div>

              {/* Edit Actions */}
              <div className="flex flex-col justify-center space-y-4">
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
                  >
                    <FaEdit />
                    Edit Profile
                  </button>
                ) : (
                  <div className="space-y-3">
                    <button
                      onClick={handleSave}
                      disabled={updateLoading}
                      className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition-colors w-full disabled:opacity-50"
                    >
                      <FaSave />
                      {updateLoading ? "Saving..." : "Save Changes"}
                    </button>
                    <button
                      onClick={handleCancel}
                      className="flex items-center justify-center gap-2 bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg transition-colors w-full"
                    >
                      <FaTimes />
                      Cancel
                    </button>
                  </div>
                )}

                {updateError && (
                  <div className="p-3 bg-red-100 text-red-700 rounded-lg border border-red-200">
                    {updateError}
                  </div>
                )}

                {updateSuccess && (
                  <div className="p-3 bg-green-100 text-green-700 rounded-lg border border-green-200">
                    {updateSuccess}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Booking History */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <FaHistory className="text-blue-600 text-xl" />
              <h2 className="text-2xl font-bold text-gray-900">Booking History</h2>
            </div>

            {bookingsLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading bookings...</p>
              </div>
            ) : bookings.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-600">No bookings found.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {bookings.map((booking) => (
                  <div key={booking.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {booking.flights?.flight_number} - {booking.flights?.airline}
                        </h3>
                        <p className="text-gray-600">
                          {booking.flights?.origin} → {booking.flights?.destination}
                        </p>
                        <p className="text-sm text-gray-500">
                          {booking.flights?.departure_time ? 
                            `${new Date(booking.flights.departure_time).toLocaleDateString()} at ${new Date(booking.flights.departure_time).toLocaleTimeString()}` : 
                            'Date not available'
                          }
                        </p>
                      </div>
                      <div className="text-right">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                          booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          booking.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {booking.status}
                        </span>
                        <p className="text-lg font-semibold text-gray-900 mt-1">
                          ${booking.total_price}
                        </p>
                        <p className="text-sm text-gray-500">
                          {booking.passenger_count} passenger(s)
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
} 