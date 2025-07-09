import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  experimental: {
    // serverComponentsExternalPackages: ['@supabase/supabase-js']
  },
  env: {
    NEXT_PUBLIC_API_URL: 'https://flight-booking-zeez.onrender.com',
  },

};

export default nextConfig;
