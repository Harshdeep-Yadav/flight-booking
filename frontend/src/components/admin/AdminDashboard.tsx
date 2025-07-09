"use client";
import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../app/AuthProvider";
import api from "../../services/api";
import { FaPlane, FaUsers, FaTicketAlt, FaDollarSign, FaChartLine, FaPlus, FaEdit, FaTrash } from "react-icons/fa";

interface AdminStats {
  totalBookings: number;
  totalRevenue: number;
  flightsToday: number;
  totalUsers: number;
  recentBookings: Array<{
    id: string;
    userId: string;
    flightId: string;
    status: string;
    createdAt: string;
  }>;
}

interface Flight {
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
  status: string;
}

interface Booking {
  id: string;
  user_id: string;
  flight_id: string;
  total_price: number;
  passenger_count: number;
  status: string;
  created_at: string;
  users?: {
    full_name: string;
    email: string;
  };
  flights?: {
    flight_number: string;
    airline: string;
    origin: string;
    destination: string;
  };
}

interface User {
  id: string;
  email: string;
  full_name: string;
  role: string;
  created_at: string;
}

type TabType = 'dashboard' | 'flights' | 'bookings' | 'users';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [flights, setFlights] = useState<Flight[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  // Flight management states
  const [showFlightModal, setShowFlightModal] = useState(false);
  const [editingFlight, setEditingFlight] = useState<Flight | null>(null);
  const [flightForm, setFlightForm] = useState({
    flight_number: '',
    airline: '',
    origin: '',
    destination: '',
    departure_time: '',
    arrival_time: '',
    price: '',
    available_seats: '',
    cabin_class: 'Economy',
    status: 'scheduled'
  });

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');

  const loadStats = useCallback(async () => {
    const response = await api.get('/admin/stats');
    console.log(response, "2123");
    if (response.status === 200) {
      setStats(response.data);
    }
  }, []);

  const loadFlights = useCallback(async () => {
    try {
      const response = await api.get(`/admin/flights?page=${currentPage}&limit=10&search=${searchTerm}`);
      if (response.status === 200) {
        setFlights(response.data.flights || []);
        setTotalPages(response.data.pagination?.pages || 1);
        console.log('Flights loaded:', {
          flights: response.data.flights?.length,
          pagination: response.data.pagination
        });
      }
    } catch (error: unknown) {
      console.error('Load flights error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to load flights';
      setError(errorMessage);
      setFlights([]);
      setTotalPages(1);
    }
  }, [currentPage, searchTerm]);

  const loadBookings = useCallback(async () => {
    const response = await api.get(`/admin/bookings?page=${currentPage}`);
    if (response.status === 200) {
      setBookings(response.data.bookings);
      setTotalPages(response.data.pagination.pages);
    }
  }, [currentPage]);

  const loadUsers = useCallback(async () => {
    const response = await api.get(`/admin/users?page=${currentPage}&search=${searchTerm}`);
    if (response.status === 200) {
      setUsers(response.data.users);
      setTotalPages(response.data.pagination.pages);
    }
  }, [currentPage, searchTerm]);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      switch (activeTab) {
        case 'dashboard':
          await loadStats();
          break;
        case 'flights':
          await loadFlights();
          break;
        case 'bookings':
          await loadBookings();
          break;
        case 'users':
          await loadUsers();
          break;
      }
    } catch (error: unknown) {
      console.error("Error loading data:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to load data";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [activeTab, loadStats, loadFlights, loadBookings, loadUsers]);

  useEffect(() => {
    if (user && user.role === "admin") {
      loadData();
    }
  }, [user, loadData]);

  // Reset current page when switching tabs or changing search
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchTerm]);

  // Flight Management Functions
  const handleFlightSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const flightData = {
        ...flightForm,
        price: parseFloat(flightForm.price),
        available_seats: parseInt(flightForm.available_seats)
      };

      if (editingFlight) {
        await api.put(`/admin/flights/${editingFlight.id}`, flightData);
      } else {
        await api.post('/admin/flights', flightData);
      }

      setShowFlightModal(false);
      setEditingFlight(null);
      resetFlightForm();
      loadFlights();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Failed to save flight";
      setError(errorMessage);
    }
  };

  const handleEditFlight = (flight: Flight) => {
    setEditingFlight(flight);
    setFlightForm({
      flight_number: flight.flight_number,
      airline: flight.airline,
      origin: flight.origin,
      destination: flight.destination,
      departure_time: flight.departure_time,
      arrival_time: flight.arrival_time,
      price: flight.price.toString(),
      available_seats: flight.available_seats.toString(),
      cabin_class: flight.cabin_class,
      status: flight.status
    });
    setShowFlightModal(true);
  };

  const handleDeleteFlight = async (flightId: string) => {
    if (window.confirm('Are you sure you want to delete this flight?')) {
      try {
        await api.delete(`/admin/flights/${flightId}`);
        loadFlights();
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : "Failed to delete flight";
        setError(errorMessage);
      }
    }
  };

  const resetFlightForm = () => {
    setFlightForm({
      flight_number: '',
      airline: '',
      origin: '',
      destination: '',
      departure_time: '',
      arrival_time: '',
      price: '',
      available_seats: '',
      cabin_class: 'Economy',
      status: 'scheduled'
    });
  };

  const handleFlightInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFlightForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setCurrentPage(1);
    setSearchTerm('');
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  if (!user || user.role !== "admin") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600">You don&apos;t have permission to access the admin dashboard.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Manage flights, bookings, and users</p>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: FaChartLine },
              { id: 'flights', label: 'Flights', icon: FaPlane },
              { id: 'bookings', label: 'Bookings', icon: FaTicketAlt },
              { id: 'users', label: 'Users', icon: FaUsers }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => handleTabChange(id as TabType)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  activeTab === id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Icon />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg border border-red-200">
            {error}
          </div>
        )}

        {/* Content */}
        {loading ? (
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        ) : (
          <>
            {/* Dashboard Tab */}
            {activeTab === 'dashboard' && stats && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-2xl shadow-xl p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Bookings</p>
                      <p className="text-3xl font-bold text-gray-900">{stats.totalBookings}</p>
                    </div>
                    <FaTicketAlt className="text-3xl text-blue-600" />
                  </div>
                </div>

                <div className="bg-white rounded-2xl shadow-xl p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                      <p className="text-3xl font-bold text-gray-900">${stats.totalRevenue.toLocaleString()}</p>
                    </div>
                    <FaDollarSign className="text-3xl text-green-600" />
                  </div>
                </div>

                <div className="bg-white rounded-2xl shadow-xl p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Flights Today</p>
                      <p className="text-3xl font-bold text-gray-900">{stats.flightsToday}</p>
                    </div>
                    <FaPlane className="text-3xl text-purple-600" />
                  </div>
                </div>

                <div className="bg-white rounded-2xl shadow-xl p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Users</p>
                      <p className="text-3xl font-bold text-gray-900">{stats.totalUsers}</p>
                    </div>
                    <FaUsers className="text-3xl text-orange-600" />
                  </div>
                </div>
              </div>
            )}

            {/* Flights Tab */}
            {activeTab === 'flights' && (
              <div className="bg-white rounded-2xl shadow-xl p-8">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Flight Management</h2>
                  <button
                    onClick={() => setShowFlightModal(true)}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    <FaPlus />
                    Add Flight
                  </button>
                </div>

                {/* Search */}
                <div className="mb-6">
                  <input
                    type="text"
                    placeholder="Search flights..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Flights Table */}
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-semibold text-gray-900">Flight</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-900">Route</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-900">Time</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-900">Price</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-900">Seats</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-900">Status</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-900">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {flights.map((flight) => (
                        <tr key={flight.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4">
                            <div>
                              <p className="font-semibold text-gray-900">{flight.flight_number}</p>
                              <p className="text-sm text-gray-600">{flight.airline}</p>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div>
                              <p className="font-medium text-gray-900">{flight.origin} → {flight.destination}</p>
                              <p className="text-sm text-gray-600">{flight.cabin_class}</p>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div>
                              <p className="text-sm text-gray-900">
                                {new Date(flight.departure_time).toLocaleDateString()}
                              </p>
                              <p className="text-sm text-gray-600">
                                {new Date(flight.departure_time).toLocaleTimeString()} - {new Date(flight.arrival_time).toLocaleTimeString()}
                              </p>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span className="font-semibold text-gray-900">${flight.price}</span>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              flight.available_seats > 10 ? 'bg-green-100 text-green-800' :
                              flight.available_seats > 0 ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {flight.available_seats} seats
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              flight.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                              flight.status === 'delayed' ? 'bg-yellow-100 text-yellow-800' :
                              flight.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {flight.status}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleEditFlight(flight)}
                                className="text-blue-600 hover:text-blue-800"
                              >
                                <FaEdit />
                              </button>
                              <button
                                onClick={() => handleDeleteFlight(flight.id)}
                                className="text-red-600 hover:text-red-800"
                              >
                                <FaTrash />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center mt-6">
                    <div className="flex gap-2">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`px-3 py-2 rounded-lg transition-colors ${
                            currentPage === page
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Bookings Tab */}
            {activeTab === 'bookings' && (
              <div className="bg-white rounded-2xl shadow-xl p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Booking Management</h2>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-semibold text-gray-900">Booking ID</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-900">Customer</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-900">Flight</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-900">Passengers</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-900">Total Price</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-900">Status</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-900">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bookings.map((booking) => (
                        <tr key={booking.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4 font-medium text-gray-900">{booking.id}</td>
                          <td className="py-3 px-4">
                            <div>
                              <p className="font-medium text-gray-900">{booking.users?.full_name || 'N/A'}</p>
                              <p className="text-sm text-gray-600">{booking.users?.email || 'N/A'}</p>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div>
                              <p className="font-medium text-gray-900">{booking.flights?.flight_number || 'N/A'}</p>
                              <p className="text-sm text-gray-600">{booking.flights?.airline || 'N/A'}</p>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span className="font-medium text-gray-900">{booking.passenger_count}</span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="font-semibold text-gray-900">${booking.total_price}</span>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                              booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              booking.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {booking.status}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-sm text-gray-600">
                              {new Date(booking.created_at).toLocaleDateString()}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center mt-6">
                    <div className="flex gap-2">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`px-3 py-2 rounded-lg transition-colors ${
                            currentPage === page
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Users Tab */}
            {activeTab === 'users' && (
              <div className="bg-white rounded-2xl shadow-xl p-8">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-semibold text-gray-900">User</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-900">Email</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-900">Role</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-900">Joined</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user) => (
                        <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4">
                            <div>
                              <p className="font-medium text-gray-900">{user.full_name}</p>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-gray-900">{user.email}</span>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              user.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                              'bg-blue-100 text-blue-800'
                            }`}>
                              {user.role}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-sm text-gray-600">
                              {new Date(user.created_at).toLocaleDateString()}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center mt-6">
                    <div className="flex gap-2">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`px-3 py-2 rounded-lg transition-colors ${
                            currentPage === page
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* Flight Modal */}
        {showFlightModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                {editingFlight ? 'Edit Flight' : 'Add New Flight'}
              </h2>
              
              <form onSubmit={handleFlightSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Flight Number</label>
                    <input
                      type="text"
                      name="flight_number"
                      value={flightForm.flight_number}
                      onChange={handleFlightInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Airline</label>
                    <input
                      type="text"
                      name="airline"
                      value={flightForm.airline}
                      onChange={handleFlightInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Origin</label>
                    <input
                      type="text"
                      name="origin"
                      value={flightForm.origin}
                      onChange={handleFlightInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Destination</label>
                    <input
                      type="text"
                      name="destination"
                      value={flightForm.destination}
                      onChange={handleFlightInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Departure Time</label>
                    <input
                      type="datetime-local"
                      name="departure_time"
                      value={flightForm.departure_time}
                      onChange={handleFlightInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Arrival Time</label>
                    <input
                      type="datetime-local"
                      name="arrival_time"
                      value={flightForm.arrival_time}
                      onChange={handleFlightInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                    <input
                      type="number"
                      name="price"
                      value={flightForm.price}
                      onChange={handleFlightInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                      min="0"
                      step="0.01"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Available Seats</label>
                    <input
                      type="number"
                      name="available_seats"
                      value={flightForm.available_seats}
                      onChange={handleFlightInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                      min="0"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Cabin Class</label>
                    <select
                      name="cabin_class"
                      value={flightForm.cabin_class}
                      onChange={handleFlightInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="Economy">Economy</option>
                      <option value="Business">Business</option>
                      <option value="First">First Class</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                      name="status"
                      value={flightForm.status}
                      onChange={handleFlightInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="scheduled">Scheduled</option>
                      <option value="delayed">Delayed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>
                
                <div className="flex gap-4 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors"
                  >
                    {editingFlight ? 'Update Flight' : 'Add Flight'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowFlightModal(false);
                      setEditingFlight(null);
                      resetFlightForm();
                    }}
                    className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 