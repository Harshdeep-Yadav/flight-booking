"use client";
import React from "react";
import Link from "next/link";
import { useAuth } from "../app/AuthProvider";
import { FaPlaneDeparture, FaHome, FaSearch, FaUser, FaTools, FaSignOutAlt } from "react-icons/fa";

export default function Navigation() {
  const { user, signOut, loading } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <>
      {/* Navbar */}
      <nav className="fixed top-0 z-50 w-full bg-white/80 backdrop-blur-md shadow-md border-b border-blue-100 flex items-center justify-between px-6 py-3">
        <div className="flex items-center gap-2">
          <FaPlaneDeparture className="text-2xl text-blue-600 drop-shadow" />
          <span className="font-extrabold text-xl text-blue-800 tracking-tight">FlightBooker</span>
        </div>
        
        <div className="flex gap-5 items-center text-slate-600 font-medium">
          <Link href="/" className="flex items-center gap-1 hover:text-indigo-600 transition-colors duration-200">
            <FaHome className="text-lg" />
            <span>Home</span>
          </Link>
          <Link href="/search" className="flex items-center gap-1 hover:text-indigo-600 transition-colors duration-200">
            <FaSearch className="text-lg" />
            <span>Search</span>
          </Link>
          
          {!loading && user ? (
            <>
              <Link href="/profile" className="flex items-center gap-1 hover:text-indigo-600 transition-colors duration-200">
                <FaUser className="text-lg" />
                <span>Profile</span>
              </Link>
              {user.role === "admin" && (
                <Link href="/admin" className="flex items-center gap-1 hover:text-indigo-600 transition-colors duration-200">
                  <FaTools className="text-lg" />
                  <span>Admin</span>
                </Link>
              )}
              <button
                onClick={handleSignOut}
                className="flex items-center gap-1 hover:text-red-600 transition-colors duration-200"
              >
                <FaSignOutAlt className="text-lg" />
                <span>Sign Out</span>
              </button>
            </>
          ) : !loading && (
            <Link href="/auth" className="flex items-center gap-1 hover:text-indigo-600 transition-colors duration-200">
              <FaUser className="text-lg" />
              <span>Sign In</span>
            </Link>
          )}
        </div>
      </nav>

      {/* Footer */}
      {/* <footer className="fixed bottom-0 z-40 w-full bg-white/80 backdrop-blur-md border-t border-blue-100 py-3 px-6 flex flex-col md:flex-row items-center justify-between shadow-inner">
        <div className="flex items-center gap-2 text-blue-700 font-semibold">
          <FaPlaneDeparture className="text-lg" />
          <span>FlightBooker</span>
        </div>
        <div className="text-gray-500 text-sm mt-2 md:mt-0 text-center">
          &copy; {new Date().getFullYear()} FlightBooker. All rights reserved.
        </div>
      </footer> */}
    </>
  );
} 