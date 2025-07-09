"use client";
import React, { useEffect } from "react";
import AdminDashboard from "../../components/admin/AdminDashboard";
import { useAuth } from "../AuthProvider";
import ProtectedRoute from "../../components/auth/ProtectedRoute";
import axios from 'axios';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export default function AdminPage() {
  const { user } = useAuth();

  useEffect(() => {
    if (user && user.role === "admin") {
      fetchAdminStats();
    }
  }, [user]);

  const fetchAdminStats = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await axios.get(`${API_BASE}/admin/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 200) {
        // Stats are handled by AdminDashboard component
        console.log("Admin stats fetched successfully");
      } else {
        console.error("Failed to fetch admin stats");
      }
    } catch (error) {
      console.error("Error fetching admin stats:", error);
    }
  };

  return (
    <ProtectedRoute requiredRole="admin">
      <AdminDashboard />
    </ProtectedRoute>
  );
} 