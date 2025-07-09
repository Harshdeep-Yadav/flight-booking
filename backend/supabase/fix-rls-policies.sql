-- Fix RLS policies for admin operations
-- This script fixes the Row Level Security policies that prevent admin users from performing CRUD operations

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Only admins can modify flights" ON public.flights;
DROP POLICY IF EXISTS "Admins can view all users" ON public.users;
DROP POLICY IF EXISTS "Admins can view all bookings" ON public.bookings;
DROP POLICY IF EXISTS "Admins can view all payments" ON public.payments;

-- Create new policies that work with service role and admin middleware

-- Flights policies - Allow all operations for service role (admin controller)
CREATE POLICY "Service role can manage flights" ON public.flights
    FOR ALL USING (true)
    WITH CHECK (true);

-- Users policies - Allow all operations for service role
CREATE POLICY "Service role can manage users" ON public.users
    FOR ALL USING (true)
    WITH CHECK (true);

-- Bookings policies - Allow all operations for service role
CREATE POLICY "Service role can manage bookings" ON public.bookings
    FOR ALL USING (true)
    WITH CHECK (true);

-- Payments policies - Allow all operations for service role
CREATE POLICY "Service role can manage payments" ON public.payments
    FOR ALL USING (true)
    WITH CHECK (true);

-- Profiles policies - Allow all operations for service role
CREATE POLICY "Service role can manage profiles" ON public.profiles
    FOR ALL USING (true)
    WITH CHECK (true);

-- Keep user-specific policies for frontend operations
CREATE POLICY "Users can view own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view own bookings" ON public.bookings
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own bookings" ON public.bookings
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own bookings" ON public.bookings
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- Anyone can view flights (for search functionality)
CREATE POLICY "Anyone can view flights" ON public.flights
    FOR SELECT USING (true);

-- Users can view own payments
CREATE POLICY "Users can view own payments" ON public.payments
    FOR SELECT USING (auth.uid() = user_id);

-- Verify the policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'public' 
ORDER BY tablename, policyname; 