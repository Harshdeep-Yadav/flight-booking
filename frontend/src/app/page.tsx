"use client";
import React from "react";
import Link from "next/link";
import { useAuth } from "./AuthProvider";
import { FaPlaneDeparture, FaSearch, FaUser, FaTicketAlt, FaGlobe, FaShieldAlt } from "react-icons/fa";

export default function HomePage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-indigo-200 to-purple-200 relative overflow-x-hidden w-full">
      {/* Hero Section */}
      <div className="relative z-10 flex flex-col items-center justify-center mt-20 text-center px-4">
        <div className="backdrop-blur-md bg-white/30 rounded-3xl shadow-2xl px-8 py-5 flex flex-col items-center gap-6 border border-white/40 animate-fade-in max-w-4xl">
          <FaPlaneDeparture className="text-6xl text-blue-700 drop-shadow-lg animate-bounce" />
          <h1 className="text-5xl md:text-7xl font-extrabold text-blue-900 mb-4 drop-shadow-lg tracking-tight">
            Welcome to FlightBooker
          </h1>
          <p className="text-xl md:text-2xl font-medium text-blue-800 opacity-90 mb-8 max-w-2xl">
            Discover amazing destinations and book your next adventure with ease.
            From local getaways to international journeys, we&apos;ve got you covered.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
            <Link
              href="/search"
              className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              <FaSearch />
              Search Flights
            </Link>
            {!user && (
              <Link
                href="/auth"
                className="flex items-center justify-center gap-2 bg-white hover:bg-gray-100 text-blue-600 px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg border-2 border-blue-600"
              >
                <FaUser />
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="relative z-10 px-4 py-10">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-blue-900 mb-16">
            Why Choose FlightBooker?
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="backdrop-blur-md bg-white/30 rounded-2xl p-8 text-center border border-white/40 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
              <FaSearch className="text-4xl text-blue-600 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-blue-900 mb-4">Smart Search</h3>
              <p className="text-blue-800">
                Find the perfect flight with our advanced search filters.
                Compare prices, schedules, and airlines all in one place.
              </p>
            </div>

            <div className="backdrop-blur-md bg-white/30 rounded-2xl p-8 text-center border border-white/40 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
              <FaTicketAlt className="text-4xl text-green-600 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-blue-900 mb-4">Easy Booking</h3>
              <p className="text-blue-800">
                Book your flights in just a few clicks.
                Get instant confirmation and e-tickets delivered to your email.
              </p>
            </div>

            <div className="backdrop-blur-md bg-white/30 rounded-2xl p-8 text-center border border-white/40 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
              <FaShieldAlt className="text-4xl text-purple-600 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-blue-900 mb-4">Secure & Reliable</h3>
              <p className="text-blue-800">
                Your data is protected with industry-standard security.
                Enjoy peace of mind with every booking.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Popular Destinations */}
      <div className="relative z-10 py-20 px-4 bg-white/20">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-blue-900 mb-16">
            Popular Destinations
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { name: "New York", code: "JFK", image: "🌆" },
              { name: "London", code: "LHR", image: "🇬🇧" },
              { name: "Tokyo", code: "NRT", image: "🗾" },
              { name: "Paris", code: "CDG", image: "🗼" },
              { name: "Sydney", code: "SYD", image: "🦘" },
              { name: "Dubai", code: "DXB", image: "🏙️" },
              { name: "Singapore", code: "SIN", image: "🌴" },
              { name: "Barcelona", code: "BCN", image: "🏛️" }
            ].map((destination) => (
              <div
                key={destination.code}
                className="backdrop-blur-md bg-white/30 rounded-xl p-6 text-center border border-white/40 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer"
              >
                <div className="text-4xl mb-3">{destination.image}</div>
                <h3 className="text-xl font-bold text-blue-900 mb-1">{destination.name}</h3>
                <p className="text-blue-700 font-medium">{destination.code}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="relative z-10 py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="backdrop-blur-md bg-white/30 rounded-3xl p-12 border border-white/40 shadow-2xl">
            <FaGlobe className="text-5xl text-blue-600 mx-auto mb-6" />
            <h2 className="text-4xl font-bold text-blue-900 mb-6">
              Ready to Start Your Journey?
            </h2>
            <p className="text-xl text-blue-800 mb-8">
              Join thousands of travelers who trust FlightBooker for their adventures.
            </p>
            <Link
              href="/search"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              <FaPlaneDeparture />
              Start Searching
            </Link>
          </div>
        </div>
      </div>

      {/* Background Elements */}
      <div className="absolute top-20 left-10 w-20 h-20 bg-blue-300 rounded-full opacity-20 animate-pulse"></div>
      <div className="absolute top-40 right-20 w-16 h-16 bg-purple-300 rounded-full opacity-20 animate-pulse delay-1000"></div>
      <div className="absolute bottom-40 left-20 w-12 h-12 bg-indigo-300 rounded-full opacity-20 animate-pulse delay-2000"></div>
      <div className="absolute bottom-20 right-10 w-24 h-24 bg-blue-300 rounded-full opacity-20 animate-pulse delay-3000"></div>
    </div>
  );
}
